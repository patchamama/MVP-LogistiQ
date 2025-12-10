<?php

namespace LogistiQ\Services;

class EasyOCRService
{
    private string $uploadsDir;
    private string $scriptsDir;
    private string $pythonCmd;

    public function __construct(
        string $uploadsDir = __DIR__ . '/../../uploads',
        string $scriptsDir = __DIR__ . '/../../scripts'
    ) {
        $this->uploadsDir = $uploadsDir;
        $this->scriptsDir = $scriptsDir;
        $this->pythonCmd = $this->detectPythonCommand();

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
            // Check if Python is available
            if (!$this->pythonCmd) {
                return [
                    'success' => false,
                    'error' => 'Python no está instalado en el servidor'
                ];
            }

            // Check if EasyOCR is installed
            if (!$this->isEasyOCRInstalled()) {
                return [
                    'success' => false,
                    'error' => 'EasyOCR no está instalado. Run: setup-easyocr.sh'
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

            // Check if Python script exists
            $pythonScript = $this->scriptsDir . '/easyocr_process.py';
            if (!file_exists($pythonScript)) {
                unlink($tempImage);
                return [
                    'success' => false,
                    'error' => 'Script de EasyOCR no encontrado'
                ];
            }

            // Run Python script with proper escaping
            $command = $this->buildPythonCommand($pythonScript, $tempImage);
            $output = @shell_exec($command);

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
     * Detect Python command (python3, python, or none)
     */
    private function detectPythonCommand(): string
    {
        // Try python3 first
        $result = @shell_exec('which python3 2>/dev/null');
        if (!empty($result)) {
            return 'python3';
        }

        // Try python as fallback
        $result = @shell_exec('which python 2>/dev/null');
        if (!empty($result)) {
            return 'python';
        }

        // Fallback: try to execute python version check
        $output = [];
        $returnCode = 0;
        @exec('python3 --version 2>&1', $output, $returnCode);
        if ($returnCode === 0) {
            return 'python3';
        }

        @exec('python --version 2>&1', $output, $returnCode);
        if ($returnCode === 0) {
            return 'python';
        }

        return '';
    }

    /**
     * Check if EasyOCR is installed
     */
    public function isEasyOCRInstalled(): bool
    {
        if (!$this->pythonCmd) {
            return false;
        }

        $command = $this->pythonCmd . ' -c "import easyocr; print(easyocr.__version__)" 2>&1';
        $output = @shell_exec($command);

        return !empty($output);
    }

    /**
     * Build Python command with proper escaping
     */
    private function buildPythonCommand(string $scriptPath, string $imagePath): string
    {
        // Escape paths for shell
        $scriptPath = escapeshellarg($scriptPath);
        $imagePath = escapeshellarg($imagePath);

        // Build command with stderr redirected
        return "{$this->pythonCmd} {$scriptPath} {$imagePath} 2>/dev/null";
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
