import { useTranslation } from 'react-i18next'

export default function LoadingSpinner() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">{t('loading')}</span>
    </div>
  )
}
