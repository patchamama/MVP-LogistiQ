import { useCallback } from 'react'
import { APIResponse } from '../types/product'

interface ErrorDetailsModalProps {
  error: APIResponse | null
  onClose: () => void
  isOpen?: boolean
}

export default function ErrorDetailsModal({ error, onClose, isOpen = true }: ErrorDetailsModalProps) {
  if (!error || !isOpen) return null

  const details = error.details || {}
  const statusCode = error.statusCode || 'Unknown'
  const message = error.message || 'Sin mensaje'

  const copyToClipboard = useCallback(() => {
    // Construir texto formateado
    let text = '════════════════════════════════════════\n'
    text += 'REPORTE DE ERROR - PARA DESARROLLADORES\n'
    text += '════════════════════════════════════════\n\n'

    text += '📌 ERROR PRINCIPAL:\n'
    text += `${message}\n\n`

    text += '🌐 SOLICITUD HTTP:\n'
    text += `   URL: ${details.url || 'No disponible'}\n`
    text += `   Método: ${details.method || 'POST'}\n`
    text += `   Código HTTP: ${statusCode}\n`
    text += `   Error Code: ${details.errorCode || 'UNKNOWN'}\n\n`

    if (details.backendMessage || details.backendDetails) {
      text += '⚙️  RESPUESTA DEL BACKEND:\n'
      if (details.backendMessage) {
        text += `   Mensaje: ${details.backendMessage}\n`
      }
      if (details.backendDetails) {
        text += `   Detalles: ${typeof details.backendDetails === 'object'
          ? JSON.stringify(details.backendDetails, null, 2)
          : details.backendDetails}\n`
      }
      text += '\n'
    }

    text += '💻 INFORMACIÓN DEL CLIENTE:\n'
    text += `   Hora: ${details.timestamp || new Date().toISOString()}\n`
    text += `   User-Agent: ${details.userAgent || navigator.userAgent}\n`
    text += `   Axios Error: ${details.axiosError || 'N/A'}\n\n`

    if (details.backendDetails) {
      text += '📋 DETALLES TÉCNICOS:\n'
      text += JSON.stringify(details.backendDetails, null, 2) + '\n\n'
    }

    text += '════════════════════════════════════════'

    navigator.clipboard.writeText(text)
      .then(() => alert('Error copiado al portapapeles'))
      .catch(() => alert('No se pudo copiar al portapapeles'))
  }, [details, statusCode, message])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-red-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">🔴 Detalles del Error</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-sm font-mono">
          {/* Error Principal */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-bold text-red-700 mb-2">📌 ERROR PRINCIPAL</h3>
            <p className="text-red-600 break-all">{message}</p>
          </div>

          {/* Solicitud HTTP */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-700 mb-2">🌐 SOLICITUD HTTP</h3>
            <div className="space-y-1 text-blue-600">
              <div>
                <span className="font-semibold">URL:</span> {details.url || 'No disponible'}
              </div>
              <div>
                <span className="font-semibold">Método:</span> {details.method || 'POST'}
              </div>
              <div>
                <span className="font-semibold">Código HTTP:</span> <span className="bg-red-200 px-2 py-1 rounded">{statusCode}</span>
              </div>
              <div>
                <span className="font-semibold">Error Code:</span>{' '}
                <span className="bg-yellow-200 px-2 py-1 rounded">{details.errorCode || 'UNKNOWN'}</span>
              </div>
            </div>
          </div>

          {/* Respuesta del Backend */}
          {(details.backendMessage || details.backendDetails) && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-bold text-orange-700 mb-2">⚙️  RESPUESTA DEL BACKEND</h3>
              <div className="space-y-2 text-orange-600 break-all">
                {details.backendMessage && (
                  <div>
                    <span className="font-semibold">Mensaje:</span> {details.backendMessage}
                  </div>
                )}
                {details.backendDetails && (
                  <div>
                    <span className="font-semibold">Detalles:</span>
                    <pre className="bg-white p-2 rounded mt-1 overflow-x-auto">
                      {typeof details.backendDetails === 'object'
                        ? JSON.stringify(details.backendDetails, null, 2)
                        : details.backendDetails}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información del Cliente */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-700 mb-2">💻 INFORMACIÓN DEL CLIENTE</h3>
            <div className="space-y-1 text-gray-600 break-all">
              <div>
                <span className="font-semibold">Hora:</span> {details.timestamp || new Date().toISOString()}
              </div>
              <div>
                <span className="font-semibold">User-Agent:</span> {details.userAgent || navigator.userAgent}
              </div>
              {details.axiosError && (
                <div>
                  <span className="font-semibold">Axios Error:</span> {details.axiosError}
                </div>
              )}
            </div>
          </div>

          {/* Detalles Técnicos */}
          {details.backendDetails && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-bold text-purple-700 mb-2">📋 DETALLES TÉCNICOS</h3>
              <pre className="bg-white p-3 rounded overflow-x-auto text-xs">
                {JSON.stringify(details.backendDetails, null, 2)}
              </pre>
            </div>
          )}

          {/* Instrucciones */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-yellow-700 mb-2">📢 PARA REPORTAR ESTE ERROR</h3>
            <ul className="text-yellow-600 space-y-1 list-disc list-inside">
              <li>Incluye el código HTTP: <span className="bg-yellow-200 px-1 rounded font-semibold">{statusCode}</span></li>
              <li>Incluye el Error Code: <span className="bg-yellow-200 px-1 rounded font-semibold">{details.errorCode || 'UNKNOWN'}</span></li>
              <li>Incluye la URL del endpoint: {details.url || 'N/A'}</li>
              <li>Copia toda la información usando el botón de abajo</li>
            </ul>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 p-4 flex gap-2">
          <button
            onClick={copyToClipboard}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
          >
            📋 Copiar Información Completa
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
