import { APIResponse } from '../types/product'

interface ProductResultProps {
  result: APIResponse
  onReset: () => void
}

export default function ProductResult({ result, onReset }: ProductResultProps) {
  if (!result.success || !result.product) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Error</h3>
          <p className="text-red-700">{result.message || 'No se pudo procesar la imagen'}</p>
        </div>
        <button
          onClick={onReset}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  const { ocr_result, product } = result

  return (
    <div className="space-y-4">
      {ocr_result && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Datos OCR</h3>
          <div className="space-y-1 text-sm text-blue-700">
            <p><span className="font-medium">Motor:</span> {ocr_result.engine_used}</p>
            <p><span className="font-medium">Texto reconocido:</span> {ocr_result.raw_text}</p>
            <p><span className="font-medium">Código filtrado:</span> {ocr_result.filtered_code}</p>
          </div>
        </div>
      )}

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-3">Información del Producto</h3>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">Código:</span>
            <p className="text-gray-900">{product.code}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Nombre:</span>
            <p className="text-gray-900">{product.name}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Descripción:</span>
            <p className="text-gray-900">{product.description}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Categoría:</span>
            <p className="text-gray-900">{product.category}</p>
          </div>
          <div className="pt-2 border-t border-green-200 flex justify-between">
            <div>
              <span className="font-medium text-gray-700">Precio:</span>
              <p className="text-lg font-semibold text-green-700">€{product.price.toFixed(2)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Stock:</span>
              <p className="text-lg font-semibold text-orange-600">{product.stock} unidades</p>
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Ubicaciones:</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {product.locations.map((loc, idx) => (
                <span key={idx} className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">
                  {loc}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-700">Proveedor:</span>
            <p className="text-gray-900">{product.supplier}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Escanear otro producto
      </button>
    </div>
  )
}
