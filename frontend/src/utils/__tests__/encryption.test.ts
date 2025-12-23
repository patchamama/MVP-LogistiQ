import { describe, it, expect } from 'vitest'
import CryptoJS from 'crypto-js'
import { decryptAPIKey, isValidEncryptionKey } from '../encryption'

describe('Encryption Utils', () => {
  // Datos del servidor actual - VALOR ENCRIPTADO CON DETERMINISTIC IV (SHA256 hash)
  const mockData = {
    encryption_key: 'e2fc2fd87dd8723c0c2cb63cf8fed51f44925269958bb15058ac05e12fea9acd',
    api_key_encrypted: 'ZTg2YzM4NzAzOGYwNDE5NTdlYzcyZDkyMzhmMDQwYTE6OnZtZXh4VEtySzRDQ0xTTzBEZVErTnZhLzJDcTZRVDA3Wlc1NDJYNHNiazh0WFRkdEVvT2svMUxoZERpUE5nKzdtRlkvNFVHeS9zVXNkNlY3amdxbkFMN1g2a3dzTGNBekEvWGJIMDQveUs3VG9ESTFYUE4rZGtPSU5kaEl5SXdxeG1SbjB0Uy8rY3RORGoyWUxDRTBYK00yK2NKbFFwMlZsbnlsSUkvMzFCRHdnQ2I4Z3hxU1F6UisrOE5ReXJGdjM1aDFqakUwYTdOMENLQXZnQjJ0NG11b1RtMmlLTGtxRlJVMkJQL2RRcFU9'
  }

  describe('decryptAPIKey', () => {
    it('debería validar encryption key correctamente', () => {
      const isValid = isValidEncryptionKey(mockData.encryption_key)
      console.log('Encryption key válido:', isValid)
      console.log('Encryption key:', mockData.encryption_key)
      console.log('Longitud:', mockData.encryption_key.length)
      expect(isValid).toBe(true)
    })

    it('debería decodificar el base64 principal correctamente', () => {
      try {
        const decoded = atob(mockData.api_key_encrypted)
        console.log('Base64 decodificado correctamente')
        console.log('Decoded length:', decoded.length)
        console.log('Decoded preview:', decoded.substring(0, 100))

        // Intentar separar por ::
        const parts = decoded.split('::', 2)
        console.log('Parts count:', parts.length)

        if (parts.length === 2) {
          const [ivHex, encryptedPayload] = parts
          console.log('IV (hex):', ivHex)
          console.log('IV length:', ivHex.length)
          console.log('Encrypted payload length:', encryptedPayload.length)
          console.log('Encrypted payload preview:', encryptedPayload.substring(0, 50))

          expect(parts.length).toBe(2)
          expect(ivHex.length).toBe(32) // 16 bytes = 32 hex chars
        } else {
          throw new Error('No se pudo separar IV y encrypted')
        }
      } catch (error) {
        console.error('Error decodificando:', error)
        throw error
      }
    })

    it('debería desencriptar correctamente con CryptoJS', () => {
      try {
        console.log('\n=== TEST DE DESENCRIPTACIÓN CON NUEVO VALOR ===')
        console.log('Encryption key:', mockData.encryption_key)
        console.log('API key encrypted:', mockData.api_key_encrypted.substring(0, 50), '...')

        // Usar la función original decryptAPIKey
        const result = decryptAPIKey(
          mockData.api_key_encrypted,
          mockData.encryption_key,
          true
        )

        console.log('✓ DESENCRIPTACIÓN EXITOSA!')
        console.log('Resultado:', result.substring(0, 30), '...')
        console.log('Longitud:', result.length)

        // Validar que es un API key válido
        expect(result).toContain('sk-proj-')
        expect(result.length).toBeGreaterThan(100)
        console.log('✓ Validaciones pasadas')
      } catch (error: any) {
        console.error('✗ ERROR EN DESENCRIPTACIÓN:', error.message)
        throw error
      }
    })

    it('no debería encriptar si isEncrypted es false', () => {
      const plainText = 'test-api-key'
      const result = decryptAPIKey(plainText, mockData.encryption_key, false)
      expect(result).toBe(plainText)
    })
  })
})
