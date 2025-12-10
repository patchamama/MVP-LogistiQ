<?php

namespace LogistiQ\Services;

class EasyOCRService
{
    private string $uploadsDir;
    private string $scriptsDir;

    public function __construct(
        string $uploadsDir = __DIR__ . '/../../uploads',
        string $scriptsDir = __DIR__ . '/../../scripts'
    ) {
        $this->uploadsDir = $uploadsDir;
        $this->scriptsDir = $scriptsDir;

        if (!is_dir($this->uploadsDir)) {
            mkdir($this->uploadsDir, 0755, true);
        }
    }

    /**
     * Process image with EasyOCR
     */
    public function processImage(string $imageBase64): array
    {
        try {
            // Save temporary image
            $tempImage = $this->saveTempImage($imageBase64);

            if (!$tempImage) {
                return [
                    'success' => false,
                    'error' => 'No se pudo guardar la imagen temporal'
                ];
            }

            // Check if Python script exists
            $pythonScript = $this->scriptsDir . '/easyocr_process.py';
            if (!file_exists($pythonScript)) {
                unlink($tempImage);
                return [
                    'success' => false,
                    'error' => 'Script de EasyOCR no encontrado'
                ];
            }

            // Run Python script
            $command = sprintf('python3 "%s" "%s" 2>/dev/null', $pythonScript, $tempImage);
            $output = shell_exec($command);

            unlink($tempImage);

            if (!$output) {
                return [
                    'success' => false,
                    'error' => 'Error al procesar OCR con EasyOCR'
                ];
            }

            // Parse JSON response from Python
            $result = json_decode($output, true);

            if (!$result || !isset($result['raw_text'])) {
                return [
                    'success' => false,
                    'error' => 'Respuesta inválida de EasyOCR'
                ];
            }

            $filteredCode = $this->filterText($result['raw_text']);

            return [
                'success' => true,
                'raw_text' => $result['raw_text'],
                'filtered_code' => $filteredCode,
                'engine_used' => 'easyocr'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Excepción: ' . $e->getMessage()
            ];
        }
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
     */
    private function filterText(string $text): string
    {
        // Remove extra whitespace and newlines
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        // Extract only alphanumeric characters and common separators
        $filtered = preg_replace('/[^a-zA-Z0-9\-_\s]/', '', $text);

        // Remove extra spaces
        $filtered = preg_replace('/\s+/', ' ', $filtered);

        // Take the first potential code
        $codes = array_filter(explode(' ', trim($filtered)));
        return reset($codes) ?: '';
    }
}
