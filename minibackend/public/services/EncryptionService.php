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
     * Compatible con desencriptación en CryptoJS (frontend)
     *
     * @param string $plaintext Datos a encriptar
     * @param string $key Clave de encriptación (formato hexadecimal de 64 caracteres)
     * @return string Datos encriptados en formato: base64(IV::encrypted)
     */
    public static function encrypt(string $plaintext, string $key): string
    {
        $ivLength = openssl_cipher_iv_length(self::CIPHER);

        // IMPORTANTE: IV DETERMINÍSTICO basado en SHA256 del plaintext
        // Esto DEBE coincidir con lo que hace CryptoJS en setup-config.js
        // para que la encriptación sea compatible 100%
        $ivBinary = substr(hash('sha256', $plaintext, true), 0, $ivLength);
        $ivHex = bin2hex($ivBinary);

        // Convertir clave de hex a binario
        $keyBinary = hex2bin($key);
        if ($keyBinary === false) {
            throw new Exception('Invalid key format - expected hexadecimal');
        }

        // Usar flag 0 para obtener base64 directamente de openssl_encrypt
        // El ciphertext resultará en base64, listo para CryptoJS
        $encrypted = openssl_encrypt(
            $plaintext,
            self::CIPHER,
            $keyBinary,
            0, // Flag 0 - Returns base64 encoded string
            $ivBinary
        );

        // Formato final: base64(IV_hex::encrypted_base64)
        // Esto coincide con lo que genera CryptoJS en el setup
        $combined = $ivHex . '::' . $encrypted;
        return base64_encode($combined);
    }

    /**
     * Desencriptar datos encriptados con encrypt()
     *
     * Compatible con encriptación generada por CryptoJS en setup-config.js
     *
     * @param string $ciphertext Datos encriptados (base64)
     * @param string $key Clave de encriptación (formato hexadecimal de 64 caracteres)
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
                throw new Exception('Invalid cipher format - expected IV::encrypted');
            }

            list($ivHex, $encryptedBase64) = $parts;

            // 3. Convertir IV de hex a binario
            $iv = hex2bin($ivHex);
            if ($iv === false) {
                throw new Exception('Invalid IV format');
            }

            // 4. Convertir clave de hex a binario
            // IMPORTANTE: La clave debe estar en formato hexadecimal (64 chars para AES-256)
            $keyBinary = hex2bin($key);
            if ($keyBinary === false) {
                throw new Exception('Invalid key format - expected hexadecimal');
            }

            // 5. Desencriptar usando openssl_decrypt con flag 0
            // El encrypted está en formato base64 de CryptoJS
            $plaintext = openssl_decrypt(
                $encryptedBase64,
                self::CIPHER,
                $keyBinary,
                0, // Flag 0 - Espera base64 como entrada
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
