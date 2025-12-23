<?php
/**
 * EncryptionService
 *
 * Handles AES-256-CBC encryption and decryption
 * with random IV for each encryption operation
 */
class EncryptionService
{
    private const CIPHER = 'AES-256-CBC';

    /**
     * Encriptar texto plano usando AES-256-CBC
     *
     * @param string $plaintext Datos a encriptar
     * @param string $key Clave de encriptación (min 32 chars)
     * @return string Datos encriptados en formato: base64(IV::encrypted)
     */
    public static function encrypt(string $plaintext, string $key): string
    {
        $ivLength = openssl_cipher_iv_length(self::CIPHER);
        $iv = openssl_random_pseudo_bytes($ivLength);

        // Usar 0 para obtener base64 directamente (sin OPENSSL_RAW_OUTPUT)
        $encrypted = openssl_encrypt(
            $plaintext,
            self::CIPHER,
            $key,
            0, // 0 = base64 output (no raw)
            $iv
        );

        // Formato: IV::encrypted (ambos en hex/base64)
        // El IV se almacena en hex para separación clara
        $ivHex = bin2hex($iv);

        // Ya está en base64, no necesitamos codificar de nuevo
        $combined = $ivHex . '::' . $encrypted;
        return base64_encode($combined);
    }

    /**
     * Desencriptar datos encriptados con encrypt()
     *
     * @param string $ciphertext Datos encriptados (base64)
     * @param string $key Clave de encriptación
     * @return string Texto plano original
     * @throws Exception Si la desencriptación falla
     */
    public static function decrypt(string $ciphertext, string $key): string
    {
        try {
            // 1. Decodificar base64 principal
            $decoded = base64_decode($ciphertext, true);
            if ($decoded === false) {
                throw new Exception('Invalid base64 data');
            }

            // 2. Separar IV y datos encriptados
            $parts = explode('::', $decoded, 2);
            if (count($parts) !== 2) {
                throw new Exception('Invalid cipher format');
            }

            list($ivHex, $encryptedBase64) = $parts;

            // 3. Convertir IV de hex a binario
            $iv = hex2bin($ivHex);
            if ($iv === false) {
                throw new Exception('Invalid IV format');
            }

            // 4. Desencriptar (el encrypted ya está en base64, usar 0 para decodificar automáticamente)
            $plaintext = openssl_decrypt(
                $encryptedBase64,
                self::CIPHER,
                $key,
                0, // 0 = espera base64 encoding, decodifica automáticamente
                $iv
            );

            if ($plaintext === false) {
                throw new Exception('Decryption failed - invalid key or corrupted data');
            }

            return $plaintext;
        } catch (Exception $e) {
            throw new Exception('EncryptionService decrypt error: ' . $e->getMessage());
        }
    }

    /**
     * Generar clave de encriptación segura
     *
     * @param int $length Longitud en bytes (default: 32 para AES-256)
     * @return string Clave en formato hexadecimal
     */
    public static function generateKey(int $length = 32): string
    {
        return bin2hex(openssl_random_pseudo_bytes($length));
    }

    /**
     * Verificar que openssl está disponible
     *
     * @return bool true si openssl está disponible
     */
    public static function isAvailable(): bool
    {
        return extension_loaded('openssl');
    }
}
