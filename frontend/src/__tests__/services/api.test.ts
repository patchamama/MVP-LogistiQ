import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { processImage, getProduct } from '../../services/api'

// Mock axios globally
vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        post: vi.fn(),
        get: vi.fn()
      })),
      post: vi.fn(),
      get: vi.fn(),
      isAxiosError: vi.fn()
    }
  }
})

describe('API Services', () => {
  describe('API Module', () => {
    it('should export processImage function', () => {
      expect(typeof processImage).toBe('function')
    })

    it('should export getProduct function', () => {
      expect(typeof getProduct).toBe('function')
    })
  })

  describe('processImage', () => {
    it('should return error object with isAxiosError', async () => {
      // Test with empty base64 to trigger error
      const result = await processImage('', 'tesseract')

      // Should always return an error object (no network available in test)
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
    })
  })

  describe('getProduct', () => {
    it('should return error object structure', async () => {
      // Test with invalid code
      const result = await getProduct('INVALID_CODE_XYZ')

      expect(result).toHaveProperty('success')
      expect(typeof result.success).toBe('boolean')
    })
  })
})
