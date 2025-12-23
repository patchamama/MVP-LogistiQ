import axios from 'axios'

/**
 * Detectar URL del MiniBACKEND basado en el entorno
 */
function getMiniApiUrl(): string {
  // Si está configurado explícitamente, usar eso
  if (import.meta.env.VITE_MINI_API_URL) {
    return import.meta.env.VITE_MINI_API_URL
  }

  // Detectar automáticamente basado en el origen
  const protocol = window.location.protocol
  const hostname = window.location.hostname
  const port = window.location.port
  const pathname = window.location.pathname

  // Si estamos en producción (https://backend.patchamama.com)
  if (hostname === 'backend.patchamama.com' || hostname === 'logistiq.patchamama.com') {
    return 'https://backend.patchamama.com/MVP-LogistiQ/minibackend/public'
  }

  // Si estamos en localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Desarrollo con npm run dev
    return 'http://localhost:9000'
  }

  // Fallback: construir URL basada en el origen actual
  // Útil para otros servidores
  return `${protocol}//${hostname}${port ? ':' + port : ''}/MVP-LogistiQ/minibackend/public`
}

const MINI_API_URL = getMiniApiUrl()

// Log para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('MiniBACKEND URL configurado a:', MINI_API_URL)
}

export interface WarehouseEntry {
  referencia: string
  fabricante: string
  cantidad: number
  operario: string
  observaciones?: string
  imagenes: string[]
}

export interface CheckReferenceResponse {
  exists: boolean
  count?: number
  total_quantity?: number
  last_entry?: {
    fabricante: string
    cantidad: number
    timestamp: string
    operario: string
    observaciones: string
  }
}

export interface CreateEntryResponse {
  success: boolean
  entry_id?: string
  message: string
  images_saved?: number
  storage_path?: string
  timestamp?: string
}

export interface Manufacturer {
  name: string
}

export interface GetManufacturersResponse {
  manufacturers: string[]
}

export interface WarehouseEntryRow {
  id: string
  referencia: string
  fabricante: string
  cantidad: number
  operario: string
  timestamp: string
  image_count: number
}

export interface GetEntriesResponse {
  total: number
  limit: number
  offset: number
  entries: WarehouseEntryRow[]
}

export interface OCREngine {
  name: string
  requires_key: boolean
  api_key_encrypted?: string
}

export interface HealthResponse {
  status: string
  timestamp: string
  version?: string
  storage_path: string
  entries_count: number
  manufacturers_count: number
  php_version: string
  ocr_engines?: OCREngine[]
  encryption_enabled?: boolean
  encryption_key?: string
}

/**
 * Crear una nueva entrada en el almacén
 */
export const createEntry = async (entry: WarehouseEntry): Promise<CreateEntryResponse> => {
  try {
    const response = await axios.post<CreateEntryResponse>(`${MINI_API_URL}/entry`, entry)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw error
  }
}

/**
 * Verificar si una referencia ya existe
 */
export const checkReference = async (ref: string): Promise<CheckReferenceResponse> => {
  try {
    const response = await axios.get<CheckReferenceResponse>(`${MINI_API_URL}/check-reference`, {
      params: { ref }
    })
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw error
  }
}

/**
 * Obtener lista de fabricantes
 */
export const getManufacturers = async (): Promise<string[]> => {
  try {
    const response = await axios.get<GetManufacturersResponse>(`${MINI_API_URL}/manufacturers`)
    return response.data.manufacturers
  } catch (error) {
    console.error('Error fetching manufacturers:', error)
    return []
  }
}

/**
 * Obtener lista de entradas (con paginación)
 */
export const getEntries = async (limit = 50, offset = 0): Promise<GetEntriesResponse> => {
  try {
    const response = await axios.get<GetEntriesResponse>(`${MINI_API_URL}/entries`, {
      params: { limit, offset }
    })
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data
    }
    throw error
  }
}

/**
 * Verificar estado del minibackend
 */
export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    const response = await axios.get<HealthResponse>(`${MINI_API_URL}/health`)
    return response.data
  } catch (error) {
    console.error('Minibackend health check failed:', error)
    throw error
  }
}

/**
 * Procesar imagen con OCR (Claude → OpenAI con fallback)
 *
 * @param imageBase64 Imagen en formato base64
 * @param claudeKey API key de Claude (opcional)
 * @param openaiKey API key de OpenAI (opcional)
 * @param language Idioma para extracción (default: es)
 * @returns Código extraído y motor usado
 */
export interface OCRProcessResponse {
  success: boolean
  code: string | null
  engine: string | null
  raw_response?: string
  error: string | null
}

export const processOCR = async (
  imageBase64: string,
  claudeKey?: string,
  openaiKey?: string,
  language = 'es'
): Promise<OCRProcessResponse> => {
  try {
    const payload: any = {
      image_base64: imageBase64,
      language
    }

    // Incluir API keys si se proporcionan
    if (claudeKey) payload.claude_api_key = claudeKey
    if (openaiKey) payload.openai_api_key = openaiKey

    const response = await axios.post<OCRProcessResponse>(
      `${MINI_API_URL}/ocr/process`,
      payload,
      {
        timeout: 60000 // 60 segundos para OCR
      }
    )

    return response.data
  } catch (error: any) {
    console.error('OCR processing failed:', error)
    return {
      success: false,
      code: null,
      engine: null,
      error: error.response?.data?.error || error.message || 'Unknown OCR error'
    }
  }
}
