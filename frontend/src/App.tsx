import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import CameraCapture from './components/CameraCapture'
import WarehouseEntry from './components/WarehouseEntry'
import QRCode from './components/QRCode'
import VersionBanner from './components/VersionBanner'
import LanguageSelector from './i18n/LanguageSelector'
import APIKeySettings from './components/APIKeySettings'

type AppView = 'ocr' | 'warehouse'

function App() {
  const { t } = useTranslation()
  const [showSettings, setShowSettings] = useState(false)
  const [activeView, setActiveView] = useState<AppView>('warehouse')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <VersionBanner />

      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('header.title')}</h1>
            <p className="text-gray-600 mt-1">{t('header.subtitle')}</p>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-semibold"
              title="Configurar API Keys para motores de IA"
            >
              ⚙️ {t('settings.title')}
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">{t('settings.title')}</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <APIKeySettings onClose={() => setShowSettings(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveView('ocr')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeView === 'ocr'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            📷 OCR
          </button>
          <button
            onClick={() => setActiveView('warehouse')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeView === 'warehouse'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            📦 Almacén
          </button>
        </div>

        {/* OCR View */}
        {activeView === 'ocr' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {t('main.title')}
              </h2>
              <p className="text-gray-600 text-sm">
                {t('main.description')}
              </p>
            </div>

            <CameraCapture />
          </div>
        )}

        {/* Warehouse View */}
        {activeView === 'warehouse' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <WarehouseEntry />
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📷 {t('features.capture.title')}</h3>
            <p className="text-sm text-gray-600">
              {t('features.capture.description')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">🔍 {t('features.ocr.title')}</h3>
            <p className="text-sm text-gray-600">
              {t('features.ocr.description')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📊 {t('features.info.title')}</h3>
            <p className="text-sm text-gray-600">
              {t('features.info.description')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">⚡ {t('features.fast.title')}</h3>
            <p className="text-sm text-gray-600">
              {t('features.fast.description')}
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-12 bg-gray-800 text-white py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>{t('footer.text')}</p>
        </div>
      </footer>

      {/* QR Code Component */}
      <QRCode />
    </div>
  )
}

export default App
