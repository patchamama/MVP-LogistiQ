import { useTranslation } from 'react-i18next'
import { APIResponse } from '../types/product'

interface ProductResultProps {
  result: APIResponse
  onReset: () => void
}

export default function ProductResult({ result, onReset }: ProductResultProps) {
  const { t } = useTranslation()

  if (!result.success || !result.product) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">{t('error')}</h3>
          <p className="text-red-700">{result.message}</p>
        </div>
        <button
          onClick={onReset}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {t('actions.tryAgain')}
        </button>
      </div>
    )
  }

  const { ocr_result, product } = result

  return (
    <div className="space-y-4">
      {ocr_result && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">{t('ocr.title')}</h3>
          <div className="space-y-1 text-sm text-blue-700">
            <p><span className="font-medium">{t('ocr.engine')}:</span> {ocr_result.engine_used}</p>
            <p><span className="font-medium">{t('ocr.rawText')}:</span> {ocr_result.raw_text}</p>
            <p><span className="font-medium">{t('ocr.filteredCode')}:</span> {ocr_result.filtered_code}</p>
          </div>
        </div>
      )}

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-3">{t('product.title')}</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">{t('product.code')}:</span>
            <p className="text-gray-900">{product.code}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">{t('product.name')}:</span>
            <p className="text-gray-900">{product.name}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">{t('product.description')}:</span>
            <p className="text-gray-900">{product.description}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">{t('product.category')}:</span>
            <p className="text-gray-900">{product.category}</p>
          </div>
          <div className="pt-2 border-t border-green-200 flex justify-between">
            <div>
              <span className="font-medium text-gray-700">{t('product.price')}:</span>
              <p className="text-lg font-semibold text-green-700">€{product.price.toFixed(2)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">{t('product.stock')}:</span>
              <p className="text-lg font-semibold text-orange-600">{product.stock} {t('product.units')}</p>
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">{t('product.locations')}:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {product.locations.map((loc, idx) => (
                <span key={idx} className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">
                  {loc}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">{t('product.supplier')}:</span>
            <p className="text-gray-900">{product.supplier}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        {t('actions.scanAnother')}
      </button>
    </div>
  )
}
