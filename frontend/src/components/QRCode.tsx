import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useTranslation } from 'react-i18next'

export default function QRCode() {
  const { t } = useTranslation()
  const [showQR, setShowQR] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg') as SVGElement
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        const link = document.createElement('a')
        link.download = 'logistiq-qr.png'
        link.href = canvas.toDataURL('image/png')
        link.click()
      }

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  const getAppUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/MVP-LogistiQ`
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setShowQR(!showQR)}
        className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition flex items-center justify-center text-xl"
        title={t('qr.title') || 'QR Code'}
      >
        ⚙️
      </button>

      {/* QR Code Panel */}
      {showQR && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-2xl p-6 w-80 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              {t('qr.title') || 'QR Code'}
            </h3>
            <button
              onClick={() => setShowQR(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {t('qr.description') || 'Escanea este código QR para acceder a la aplicación'}
          </p>

          {/* QR Code */}
          <div ref={qrRef} className="flex justify-center mb-4 bg-gray-50 p-4 rounded">
            <QRCodeSVG
              value={getAppUrl()}
              size={200}
              level="H"
              includeMargin
            />
          </div>

          {/* URL Display */}
          <div className="bg-gray-100 rounded p-3 mb-4 break-words">
            <p className="text-xs text-gray-600 font-mono">
              {getAppUrl()}
            </p>
          </div>

          {/* Download Button */}
          <button
            onClick={downloadQR}
            className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
          >
            {t('qr.download') || '📥 Descargar QR'}
          </button>
        </div>
      )}
    </div>
  )
}
