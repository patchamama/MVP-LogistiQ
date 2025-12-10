import CameraCapture from './components/CameraCapture'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">LogistiQ</h1>
          <p className="text-gray-600 mt-1">Gestión de Inventario con OCR</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Escanea una etiqueta de producto
            </h2>
            <p className="text-gray-600 text-sm">
              Usa tu cámara o carga una imagen para reconocer códigos de productos y obtener información del inventario.
            </p>
          </div>

          <CameraCapture />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📷 Captura</h3>
            <p className="text-sm text-gray-600">
              Abre tu cámara y captura una foto clara de la etiqueta del producto.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">🔍 OCR</h3>
            <p className="text-sm text-gray-600">
              El sistema reconoce automáticamente el código del producto usando inteligencia artificial.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Información</h3>
            <p className="text-sm text-gray-600">
              Obtén detalles como precio, stock y ubicación del producto en el almacén.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-800 mb-2">⚡ Rápido</h3>
            <p className="text-sm text-gray-600">
              Funciona sin conexión a internet. Carga tus datos una sola vez.
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-12 bg-gray-800 text-white py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>LogistiQ MVP © 2024</p>
        </div>
      </footer>
    </div>
  )
}

export default App
