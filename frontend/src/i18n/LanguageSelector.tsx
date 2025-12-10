import { useTranslation } from 'react-i18next'

export default function LanguageSelector() {
  const { i18n, t } = useTranslation()

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('logistiq_language', lang)
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow">
      <label className="text-sm font-medium text-gray-700">{t('language')}:</label>
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
    </div>
  )
}
