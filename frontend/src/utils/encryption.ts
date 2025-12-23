import CryptoJS from 'crypto-js'

/**
 * Desencriptar API key encriptada desde el MiniBACKEND
 *
 * Compatible con encriptación AES-256-CBC generada en PHP (EncryptionService)
 *
 * @param encryptedData Datos encriptados en formato: base64(IV::encrypted)
 * @param encryptionKey Clave de encriptación en formato hexadecimal (64 chars)
 * @param isEncrypted Si true, intenta desencriptar; si false, retorna tal cual
 * @returns API key en texto plano
 * @throws Error si la desencriptación falla
 */
export function decryptAPIKey(
  encryptedData: string,
  encryptionKey: string,
  isEncrypted: boolean
): string {
  // Si no está encriptado, retornar tal cual
  if (!isEncrypted || !encryptedData) {
    return encryptedData
  }

  try {
    // 1. Decodificar base64 principal para obtener IV::base64encrypted
    let decoded: string
    try {
      decoded = atob(encryptedData)
    } catch (e) {
      throw new Error('Invalid base64 format in encrypted data')
    }

    // 2. Separar IV (hex) y datos encriptados (base64)
    const parts = decoded.split('::', 2)
    if (parts.length !== 2) {
      throw new Error('Invalid cipher format - expected IV::encrypted')
    }

    const [ivHex, encryptedBase64] = parts

    // 3. Convertir IV de hex a WordArray (CryptoJS format)
    let iv: CryptoJS.lib.WordArray
    try {
      iv = CryptoJS.enc.Hex.parse(ivHex)
    } catch (e) {
      throw new Error('Invalid IV format')
    }

    // 4. Convertir key de hex a WordArray
    let key: CryptoJS.lib.WordArray
    try {
      key = CryptoJS.enc.Hex.parse(encryptionKey)
    } catch (e) {
      throw new Error('Invalid encryption key format')
    }

    // 5. El encryptedBase64 ya está en base64 (viene del PHP openssl_encrypt con flag 0)
    // CryptoJS puede desencriptar directamente desde base64
    const decrypted = CryptoJS.AES.decrypt(
      encryptedBase64, // Ya está en base64
      key,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    )

    // 6. Convertir resultado a string UTF-8
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8)

    if (!plaintext) {
      throw new Error('Decryption resulted in empty string - invalid key or corrupted data')
    }

    return plaintext
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Decryption error:', message)
    throw new Error(`Failed to decrypt API key: ${message}`)
  }
}

/**
 * Verificar si una clave de encriptación es válida (64 caracteres hex)
 */
export function isValidEncryptionKey(key: string): boolean {
  return /^[0-9a-f]{64}$/i.test(key)
}
