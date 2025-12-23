import axios from 'axios'
import { APIResponse, OCREngine, APIKeyStatus, SaveAPIKeysRequest } from '../types/product'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const processImage = async (
  imageBase64: string,
  engine: OCREngine = 'tesseract',
  userId?: string
): Promise<APIResponse> => {
  try {
    const response = await apiClient.post('/ocr/process', {
      image: imageBase64,
      engine,
      userId
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 'Unknown'
      const errorData = error.response?.data as any
      const errorMessage = errorData?.message || 'Error al procesar la imagen'
      const errorDetails = errorData?.details || errorData?.error || null

      return {
        success: false,
        error: error.message,
        message: errorMessage,
        statusCode: statusCode,
        details: errorDetails
      }
    }
    return {
      success: false,
      error: 'Error desconocido',
      message: 'Ocurrió un error al procesar la solicitud',
      statusCode: 'Network Error',
      details: null
    }
  }
}

export const getProduct = async (code: string): Promise<APIResponse> => {
  try {
    const response = await apiClient.get(`/products/${code}`)
    return {
      success: true,
      product: response.data
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.message,
        message: error.response?.data?.message || 'Producto no encontrado'
      }
    }
    return {
      success: false,
      error: 'Error desconocido',
      message: 'Ocurrió un error al buscar el producto'
    }
  }
}

export const saveAPIKeys = async (
  request: SaveAPIKeysRequest
): Promise<APIResponse> => {
  try {
    const response = await apiClient.post('/settings/api-keys', request)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.message,
        message: error.response?.data?.message || 'Error al guardar las API keys'
      }
    }
    return {
      success: false,
      error: 'Error desconocido',
      message: 'Ocurrió un error al guardar las API keys'
    }
  }
}

export const getAPIKeyStatus = async (userId: string): Promise<APIKeyStatus> => {
  try {
    const response = await apiClient.get(`/settings/api-keys/status`, {
      params: { userId }
    })
    return response.data
  } catch (error) {
    return {
      openai: false,
      anthropic: false
    }
  }
}

export const deleteAPIKeys = async (userId: string): Promise<APIResponse> => {
  try {
    const response = await apiClient.delete('/settings/api-keys', {
      data: { userId }
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.message,
        message: error.response?.data?.message || 'Error al eliminar las API keys'
      }
    }
    return {
      success: false,
      error: 'Error desconocido',
      message: 'Ocurrió un error al eliminar las API keys'
    }
  }
}

export default apiClient
