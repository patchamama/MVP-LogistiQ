export interface Product {
  code: string
  name: string
  description: string
  price: number
  stock: number
  locations: string[]
  supplier: string
  category: string
}

export interface OCRResult {
  raw_text: string
  filtered_code: string
  engine_used: string
}

export interface APIResponse {
  success: boolean
  ocr_result?: OCRResult
  product?: Product
  error?: string
  message?: string
  statusCode?: number | string
  details?: any
}

export type OCREngine =
  | 'tesseract'
  | 'easyocr'
  | 'both'
  | 'openai-vision'
  | 'claude-vision'

export interface APIKeyStatus {
  openai: boolean
  anthropic: boolean
}

export interface SaveAPIKeysRequest {
  userId: string
  openaiKey?: string
  anthropicKey?: string
}

export interface CameraError {
  name: string
  message: string
}
