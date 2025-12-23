import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { saveAPIKeys, getAPIKeyStatus, deleteAPIKeys } from '../services/api'
import { getUserID } from '../utils/userID'
import { APIKeyStatus } from '../types/product'

interface APIKeySettingsProps {
  onClose?: () => void
}

export default function APIKeySettings({ onClose }: APIKeySettingsProps) {
  const { t } = useTranslation()
  const [openaiKey, setOpenaiKey] = useState('')
  const [anthropicKey, setAnthropicKey] = useState('')
  const [keyStatus, setKeyStatus] = useState<APIKeyStatus>({ openai: false, anthropic: false })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const userId = getUserID()

  useEffect(() => {
    // Load key status on component mount
    loadKeyStatus()
  }, [])

  const loadKeyStatus = async () => {
    const status = await getAPIKeyStatus(userId)
    setKeyStatus(status)
  }

  const handleSaveKeys = async () => {
    if (!openaiKey && !anthropicKey) {
      setMessage({ type: 'error', text: 'Por favor ingresa al menos una API key' })
      return
    }

    setIsLoading(true)
    const response = await saveAPIKeys({
      userId,
      openaiKey: openaiKey || undefined,
      anthropicKey: anthropicKey || undefined
    })

    setIsLoading(false)

    if (response.success) {
      setMessage({ type: 'success', text: t('settings.keySaved') })
      setOpenaiKey('')
      setAnthropicKey('')
      loadKeyStatus()
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: 'error', text: response.message || 'Error al guardar las keys' })
    }
  }

  const handleDeleteKeys = async () => {
    if (!confirm(t('settings.deleteConfirm'))) {
      return
    }

    setIsLoading(true)
    const response = await deleteAPIKeys(userId)
    setIsLoading(false)

    if (response.success) {
      setMessage({ type: 'success', text: t('settings.keyDeleted') })
      loadKeyStatus()
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage({ type: 'error', text: response.message || 'Error al eliminar las keys' })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{t('settings.apiKeys')}</h2>

        {/* Message Alert */}
        {message && (
          <div
            className={`p-4 rounded-lg mb-4 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Warning */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 text-xs text-yellow-700">
          ⚠️ {t('settings.warning')}
        </div>

        {/* OpenAI Key Input */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">{t('settings.openaiKey')}</label>
            {keyStatus.openai && (
              <span className="text-xs text-green-600 font-semibold">{t('settings.keyConfigured')}</span>
            )}
          </div>
          <input
            type="password"
            placeholder={t('settings.enterKey')}
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">sk-proj-... o sk-...</p>
        </div>

        {/* Anthropic Key Input */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">{t('settings.anthropicKey')}</label>
            {keyStatus.anthropic && (
              <span className="text-xs text-green-600 font-semibold">{t('settings.keyConfigured')}</span>
            )}
          </div>
          <input
            type="password"
            placeholder={t('settings.enterKey')}
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">sk-ant-...</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleSaveKeys}
            disabled={isLoading}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 font-semibold text-sm"
          >
            {isLoading ? 'Guardando...' : t('settings.saveKeys')}
          </button>
          <button
            onClick={handleDeleteKeys}
            disabled={isLoading || (!keyStatus.openai && !keyStatus.anthropic)}
            className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:bg-gray-400 font-semibold text-sm"
          >
            {t('settings.deleteKeys')}
          </button>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            Cerrar
          </button>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700 space-y-1">
          <p className="font-semibold">💡 Obtén tus API keys:</p>
          <p>
            • OpenAI GPT-4 Vision:{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
              platform.openai.com
            </a>
          </p>
          <p>
            • Claude 3:{' '}
            <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="underline">
              console.anthropic.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
