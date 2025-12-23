<?php

namespace LogistiQ\Services;

/**
 * Encryption Service for secure API key storage
 * Uses AES-256-CBC encryption with random IV
 */
class EncryptionService
{
    private string $encryptionKey;
    private string $algorithm = 'AES-256-CBC';

    public function __construct()
    {
        // Get encryption key from environment or use default (should be changed in production)
        $this->encryptionKey = $_ENV['ENCRYPTION_KEY'] ?? getenv('ENCRYPTION_KEY') ?? $this->getDefaultKey();
    }

    /**
     * Encrypt data
     * Returns base64 encoded string containing IV + encrypted data
     */
    public function encrypt(string $data): string
    {
        // Generate random IV
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length($this->algorithm));

        // Encrypt the data
        $encrypted = openssl_encrypt($data, $this->algorithm, $this->encryptionKey, OPENSSL_RAW_DATA, $iv);

        // Return IV + encrypted data (both base64 encoded)
        return base64_encode($iv . $encrypted);
    }

    /**
     * Decrypt data
     * Expects base64 encoded string containing IV + encrypted data
     */
    public function decrypt(string $encryptedData): ?string
    {
        try {
            // Decode the base64 string
            $decoded = base64_decode($encryptedData);

            // Extract IV (first 16 bytes for AES)
            $iv = substr($decoded, 0, 16);

            // Extract encrypted data
            $encrypted = substr($decoded, 16);

            // Decrypt
            $decrypted = openssl_decrypt($encrypted, $this->algorithm, $this->encryptionKey, OPENSSL_RAW_DATA, $iv);

            if ($decrypted === false) {
                throw new \Exception('Decryption failed');
            }

            return $decrypted;
        } catch (\Exception $e) {
            error_log('Decryption error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generate a new encryption key
     * Should be run once and saved in .env
     */
    public static function generateEncryptionKey(): string
    {
        // Generate 32 bytes (256 bits) of random data and base64 encode it
        return base64_encode(openssl_random_pseudo_bytes(32));
    }

    /**
     * Get default encryption key (for development only)
     * NEVER use this in production
     */
    private function getDefaultKey(): string
    {
        // Default 32-byte key (base64 decoded) - CHANGE IN PRODUCTION!
        // This is: base64_encode(openssl_random_pseudo_bytes(32))
        return base64_decode('7wVz4xK8mNpQrStUvWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2');
    }
}
