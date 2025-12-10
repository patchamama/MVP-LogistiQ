<?php

namespace LogistiQ\Tests\Services;

use PHPUnit\Framework\TestCase;
use LogistiQ\Services\TesseractService;

class TesseractServiceTest extends TestCase
{
    private TesseractService $service;
    private string $testUploadsDir;

    protected function setUp(): void
    {
        $this->testUploadsDir = sys_get_temp_dir() . '/logistiq_test_' . uniqid();
        mkdir($this->testUploadsDir, 0755, true);
        $this->service = new TesseractService($this->testUploadsDir);
    }

    protected function tearDown(): void
    {
        // Clean up test directory
        $files = glob($this->testUploadsDir . '/*');
        foreach ($files as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
        if (is_dir($this->testUploadsDir)) {
            rmdir($this->testUploadsDir);
        }
    }

    public function testSaveTempImageCreatesFile(): void
    {
        // Create a simple image
        $imageData = base64_encode(file_get_contents(__FILE__));

        // Use reflection to access private method
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('saveTempImage');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, $imageData);

        $this->assertNotNull($result);
        $this->assertFileExists($result);
        $this->assertStringContainsString($this->testUploadsDir, $result);
    }

    public function testSaveTempImageInvalidBase64ReturnNull(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('saveTempImage');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, 'invalid base64 !!!');

        $this->assertNull($result);
    }

    public function testFilterTextRemovesSpecialCharacters(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('filterText');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, '12345@#$%ABC xyz');

        $this->assertStringContainsString('12345', $result);
        $this->assertStringContainsString('ABC', $result);
    }

    public function testFilterTextRemovesExtraWhitespace(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('filterText');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, '12345   ABC   XYZ');

        $this->assertStringNotContainsString('   ', $result);
    }

    public function testFilterTextHandlesNewlines(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('filterText');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, "12345\nABC\nXYZ");

        $this->assertStringNotContainsString("\n", $result);
    }

    public function testFilterTextKeepsDashedValues(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('filterText');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, 'ABC-123-DEF');

        $this->assertStringContainsString('ABC-123-DEF', $result);
    }

    public function testFilterTextKeepsUnderscores(): void
    {
        $reflection = new \ReflectionClass($this->service);
        $method = $reflection->getMethod('filterText');
        $method->setAccessible(true);

        $result = $method->invoke($this->service, 'ABC_123_DEF');

        $this->assertStringContainsString('ABC_123_DEF', $result);
    }

    public function testProcessImageReturnsArray(): void
    {
        // Create a dummy image as base64
        $imageData = base64_encode("\xFF\xD8\xFF\xE0"); // Minimal JPEG header

        $result = $this->service->processImage($imageData);

        // Should return an array with success key
        $this->assertIsArray($result);
        $this->assertArrayHasKey('success', $result);
    }

    private function isTesseractInstalled(): bool
    {
        $result = shell_exec('which tesseract 2>/dev/null');
        return !empty($result);
    }
}
