import { useTranslation } from 'react-i18next'
import CameraCapture from './components/CameraCapture'
import QRCode from './components/QRCode'
import LanguageSelector from './i18n/LanguageSelector'

function App() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('header.title')}</h1>
            <p className="text-gray-600 mt-1">{t('header.subtitle')}</p>
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
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
