import axios from 'axios'

const MINI_API_URL = import.meta.env.VITE_MINI_API_URL || 'http://localhost:9000/api'

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

export interface HealthResponse {
  status: string
  timestamp: string
  storage_path: string
  entries_count: number
  manufacturers_count: number
  php_version: string
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
