import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getOperarioName, saveOperarioName } from '../utils/operarioStorage'

interface OperarioModalProps {
  isOpen: boolean
  onConfirm: (operarioName: string) => void
}

export default function OperarioModal({ isOpen, onConfirm }: OperarioModalProps) {
  const { t } = useTranslation()
  const [operarioName, setOperarioName] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Cargar el nombre guardado cuando se abre el modal
      const savedName = getOperarioName()
      setOperarioName(savedName)
      setError(null)
    }
  }, [isOpen])

  const handleConfirm = () => {
    const trimmed = operarioName.trim()

    if (!trimmed) {
      setError('El nombre del operario es requerido')
      return
    }

    if (trimmed.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }

    // Guardar en localStorage
    saveOperarioName(trimmed)

    // Notificar al padre
    onConfirm(trimmed)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">
            👤 {t('operario.modal.title', 'Nombre del Operario')}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm">
            {t('operario.modal.description', 'Por favor ingresa tu nombre. Este será utilizado en todas las entradas que registres.')}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('operario.modal.label', 'Nombre del Operario')}
            </label>
            <input
              type="text"
              value={operarioName}
              onChange={(e) => {
                setOperarioName(e.target.value)
                setError(null)
              }}
              onKeyPress={handleKeyPress}
              placeholder={t('operario.modal.placeholder', 'Ej: Juan García')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">⚠️ {error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
            >
              {t('operario.modal.confirm', 'Continuar')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
