/**
 * OCR Service - Direct integration with Claude Vision and OpenAI Vision
 *
 * Handles image processing with vision APIs directly from the frontend
 * Supports fallback: Claude → OpenAI
 */

import { decryptAPIKey } from '../utils/encryption'

export interface OCRResult {
  success: boolean
  code: string | null
  engine: 'claude' | 'openai' | null
  error: string | null
  rawResponse?: string
}

/**
 * Get extraction prompt in the specified language
 */
function getExtractionPrompt(language = 'es'): string {
  if (language === 'en') {
    return `Analyze this image and extract any visible reference codes, product codes, QR codes, or identifying numbers.

Your response MUST be in this exact JSON format:
{
  "code": "THE_EXTRACTED_CODE_OR_REFERENCE",
  "confidence": "high/medium/low",
  "type": "qr_code/reference_number/product_code/barcode/other",
  "details": "Brief description of what was found"
}

If no code is found, return:
{
  "code": null,
  "confidence": "low",
  "type": "none",
  "details": "No identifiable code found in the image"
}

IMPORTANT: Always respond with valid JSON only, no additional text.`
  }

  // Default Spanish prompt
  return `Analiza esta imagen y extrae cualquier código de referencia, número de producto, código QR o número de identificación visible.

Tu respuesta DEBE estar en este formato JSON exacto:
{
  "code": "EL_CÓDIGO_O_REFERENCIA_EXTRAÍDA",
  "confidence": "alta/media/baja",
  "type": "codigo_qr/numero_referencia/codigo_producto/codigo_barras/otro",
  "details": "Descripción breve de lo encontrado"
}

Si no se encuentra ningún código, retorna:
{
  "code": null,
  "confidence": "baja",
  "type": "ninguno",
  "details": "No se encontró ningún código identificable en la imagen"
}

IMPORTANTE: Siempre responde solo con JSON válido, sin texto adicional.`
}

/**
 * Process image with Claude Vision (primary)
 */
async function processWithClaude(
  imageBase64: string,
  apiKey: string,
  language = 'es'
): Promise<OCRResult> {
  try {
    const prompt = getExtractionPrompt(language)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: null,
        engine: 'claude',
        error: `Claude API error: ${response.status} - ${error}`
      }
    }

    const data = await response.json() as any
    const responseText = data.content?.[0]?.text || ''

    const code = extractCode(responseText)

    return {
      success: true,
      code,
      engine: 'claude',
      rawResponse: responseText,
      error: null
    }
  } catch (error) {
    return {
      success: false,
      code: null,
      engine: 'claude',
      error: error instanceof Error ? error.message : 'Unknown Claude error'
    }
  }
}

/**
 * Process image with OpenAI Vision (fallback)
 */
async function processWithOpenAI(
  imageBase64: string,
  apiKey: string,
  language = 'es'
): Promise<OCRResult> {
  try {
    const prompt = getExtractionPrompt(language)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'auto'
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      return {
        success: false,
        code: null,
        engine: 'openai',
        error: `OpenAI API error: ${response.status} - ${error}`
      }
    }

    const data = await response.json() as any
    const responseText = data.choices?.[0]?.message?.content || ''

    const code = extractCode(responseText)

    return {
      success: true,
      code,
      engine: 'openai',
      rawResponse: responseText,
      error: null
    }
  } catch (error) {
    return {
      success: false,
      code: null,
      engine: 'openai',
      error: error instanceof Error ? error.message : 'Unknown OpenAI error'
    }
  }
}

/**
 * Extract code from vision API response
 */
function extractCode(response: string): string | null {
  try {
    // Try to parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*"code"[\s\S]*\}/)
    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[0]) as any
      if (json.code && json.code !== 'null' && json.code !== null) {
        return json.code
      }
    }
  } catch {
    // Continue to pattern matching
  }

  // Try to find alphanumeric codes
  const codeMatch = response.match(/[A-Z0-9]{5,}/)
  if (codeMatch) {
    return codeMatch[0]
  }

  return null
}

/**
 * Process image with vision APIs
 * Tries Claude first, falls back to OpenAI
 */
export async function processImageWithOCR(
  imageBase64: string,
  encryptedClaudeKey?: string,
  encryptedOpenAIKey?: string,
  encryptionKey?: string,
  language = 'es'
): Promise<OCRResult> {
  // Decrypt keys if encrypted versions and encryption key provided
  let claudeKey: string | undefined
  let openaiKey: string | undefined

  if (encryptedClaudeKey && encryptionKey) {
    try {
      claudeKey = decryptAPIKey(encryptedClaudeKey, encryptionKey, true)
    } catch (err) {
      console.error('Failed to decrypt Claude key:', err)
    }
  }

  if (encryptedOpenAIKey && encryptionKey) {
    try {
      openaiKey = decryptAPIKey(encryptedOpenAIKey, encryptionKey, true)
    } catch (err) {
      console.error('Failed to decrypt OpenAI key:', err)
    }
  }

  // Try Claude first
  if (claudeKey) {
    console.log('🤖 Attempting OCR with Claude Vision...')
    const result = await processWithClaude(imageBase64, claudeKey, language)
    if (result.success) {
      console.log(`✓ Code extracted with Claude: ${result.code}`)
      return result
    }
    console.warn('⚠️ Claude failed, trying OpenAI fallback:', result.error)
  }

  // Fallback to OpenAI
  if (openaiKey) {
    console.log('🔄 Falling back to OpenAI Vision...')
    const result = await processWithOpenAI(imageBase64, openaiKey, language)
    if (result.success) {
      console.log(`✓ Code extracted with OpenAI: ${result.code}`)
      return result
    }
    console.error('✗ OpenAI also failed:', result.error)
    return result
  }

  // No API keys available
  return {
    success: false,
    code: null,
    engine: null,
    error: 'No API keys available for OCR processing'
  }
}
