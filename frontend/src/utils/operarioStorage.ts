/**
 * Gestión de persistencia del nombre del operario en localStorage
 */

const OPERARIO_STORAGE_KEY = 'logistiq_operario_name'

/**
 * Obtener el nombre del operario guardado
 */
export function getOperarioName(): string {
  try {
    const stored = localStorage.getItem(OPERARIO_STORAGE_KEY)
    return stored || ''
  } catch (error) {
    console.error('Error reading operario from localStorage:', error)
    return ''
  }
}

/**
 * Guardar el nombre del operario
 */
export function saveOperarioName(name: string): void {
  try {
    const trimmed = name.trim()
    if (trimmed) {
      localStorage.setItem(OPERARIO_STORAGE_KEY, trimmed)
    }
  } catch (error) {
    console.error('Error saving operario to localStorage:', error)
  }
}

/**
 * Limpiar el nombre del operario guardado
 */
export function clearOperarioName(): void {
  try {
    localStorage.removeItem(OPERARIO_STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing operario from localStorage:', error)
  }
}
