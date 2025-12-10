<?php

namespace LogistiQ\Services;

class TesseractService
{
    private string $uploadsDir;

    public function __construct(string $uploadsDir = __DIR__ . '/../../uploads')
    {
        $this->uploadsDir = $uploadsDir;
        if (!is_dir($this->uploadsDir)) {
            mkdir($this->uploadsDir, 0755, true);
        }
    }

    /**
     * Process image with Tesseract OCR
     */
    public function processImage(string $imageBase64): array
    {
        try {
            // Check if tesseract is installed
            if (!$this->isTesseractInstalled()) {
                return [
                    'success' => false,
                    'error' => 'Tesseract no está instalado en el servidor'
                ];
            }

            // Save temporary image
            $tempImage = $this->saveTempImage($imageBase64);

            if (!$tempImage) {
                return [
                    'success' => false,
                    'error' => 'No se pudo guardar la imagen temporal'
                ];
            }

            // Run tesseract
            $tempOutput = sys_get_temp_dir() . '/ocr_' . uniqid();
            $command = $this->buildTesseractCommand($tempImage, $tempOutput);

            exec($command, $output, $returnCode);

            if ($returnCode !== 0) {
                unlink($tempImage);
                return [
                    'success' => false,
                    'error' => 'Error al procesar OCR con Tesseract'
                ];
            }

            // Read result
            $resultFile = $tempOutput . '.txt';
            if (!file_exists($resultFile)) {
                unlink($tempImage);
                return [
                    'success' => false,
                    'error' => 'Tesseract no generó resultado'
                ];
            }

            $rawText = trim(file_get_contents($resultFile));
            unlink($tempImage);
            unlink($resultFile);

            // Filter and normalize the result
            $filteredCode = $this->filterText($rawText);

            return [
                'success' => true,
                'raw_text' => $rawText,
                'filtered_code' => $filteredCode,
                'engine_used' => 'tesseract'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Excepción: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Check if Tesseract is installed
     */
    public function isTesseractInstalled(): bool
    {
        // Try standard which command (works on macOS, Linux)
        $result = @shell_exec('which tesseract 2>/dev/null');
        if (!empty($result)) {
            return true;
        }

        // Fallback: try to execute tesseract --version
        $output = [];
        $returnCode = 0;
        @exec('tesseract --version 2>&1', $output, $returnCode);

        return $returnCode === 0;
    }

    /**
     * Build Tesseract command based on OS
     */
    private function buildTesseractCommand(string $imagePath, string $outputPath): string
    {
        // Escape paths for shell
        $imagePath = escapeshellarg($imagePath);
        $outputPath = escapeshellarg($outputPath);

        // Use tesseract with language detection
        // Redirect stderr to avoid cluttering output
        return "tesseract $imagePath $outputPath -l spa+eng 2>/dev/null";
    }

    /**
     * Save base64 image to temporary file
     */
    private function saveTempImage(string $imageBase64): ?string
    {
        try {
            $imageData = base64_decode($imageBase64, true);
            if ($imageData === false) {
                return null;
            }

            $tempFile = $this->uploadsDir . '/temp_' . uniqid() . '.jpg';
            file_put_contents($tempFile, $imageData);

            return $tempFile;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Filter text to extract product codes
     * Keeps alphanumeric characters and common separators
     */
    private function filterText(string $text): string
    {
        // Remove extra whitespace and newlines
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        // Extract only alphanumeric characters and common separators
        // Remove special characters except dash, underscore, and space
        $filtered = preg_replace('/[^a-zA-Z0-9\-_\s]/', '', $text);

        // Remove extra spaces
        $filtered = preg_replace('/\s+/', ' ', $filtered);

        // If we have multiple potential codes, take the first one
        $codes = array_filter(explode(' ', trim($filtered)));
        return reset($codes) ?: '';
    }
}
