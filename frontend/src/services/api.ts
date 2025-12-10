import axios from 'axios'
import { APIResponse } from '../types/product'

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const processImage = async (
  imageBase64: string,
  engine: 'tesseract' | 'easyocr' | 'both' = 'tesseract'
): Promise<APIResponse> => {
  try {
    const response = await apiClient.post('/ocr/process', {
      image: imageBase64,
      engine
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.message,
        message: error.response?.data?.message || 'Error al procesar la imagen'
      }
    }
    return {
      success: false,
      error: 'Error desconocido',
      message: 'Ocurrió un error al procesar la solicitud'
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

export default apiClient
