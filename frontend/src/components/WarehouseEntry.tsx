import { useState, useRef, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  createEntry,
  checkReference,
  getManufacturers,
  checkHealth,
  type WarehouseEntry,
  type OCREngine,
} from '../services/miniapi'
import { processImageWithOCR } from '../services/ocr'
import { getUserID } from '../utils/userID'
import LoadingSpinner from './LoadingSpinner'

// Suppressing unused variable warnings for now
// eslint-disable-next-line @typescript-eslint/no-unused-vars

type Step = 'scan' | 'confirm' | 'photos' | 'details' | 'success'

interface ReferenceCheckStatus {
  loading: boolean
  exists: boolean
  count?: number
  total_quantity?: number
}

export default function WarehouseEntry() {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Estados principales
  const [step, setStep] = useState<Step>('scan')
  const [referencia, setReferencia] = useState('')
  const [referenciaConfirmed, setReferenciaConfirmed] = useState(false)
  const [fabricante, setFabricante] = useState('')
  const [nuevoFabricante, setNuevoFabricante] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [operario, setOperario] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [imagenes, setImagenes] = useState<string[]>([])
  const [manufacturers, setManufacturers] = useState<string[]>([])
  const [referenceCheckStatus, setReferenceCheckStatus] = useState<ReferenceCheckStatus>({
    loading: false,
    exists: false,
  })

  // Estados de UI
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [cameraMode, setCameraMode] = useState<'label' | 'photos' | null>(null)

  // Estados de generación de referencia
  const [generatingReference, setGeneratingReference] = useState(false)

  // Estados de OCR
  const [ocrEngine, setOcrEngine] = useState<string>('tesseract')
  const [availableEngines, setAvailableEngines] = useState<OCREngine[]>([])

  // Estados de encriptación
  const [encryptionEnabled, setEncryptionEnabled] = useState(false)
  const [encryptionKey, setEncryptionKey] = useState<string>('')
  const [encryptedKeys, setEncryptedKeys] = useState<{ [key: string]: string }>({})

  // Cargar fabricantes y engines OCR al montar
  useEffect(() => {
    loadManufacturers()
    loadAvailableOCREngines()
  }, [])

  // Cleanup de stream al desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  const loadManufacturers = async () => {
    try {
      const mfgs = await getManufacturers()
      setManufacturers(mfgs)
    } catch (err) {
      console.error('Error loading manufacturers:', err)
    }
  }

  const loadAvailableOCREngines = async () => {
    try {
      const health = await checkHealth()

      if (health.ocr_engines && health.ocr_engines.length > 0) {
        setAvailableEngines(health.ocr_engines)
        // Set default to first available engine
        if (health.ocr_engines.length > 0) {
          setOcrEngine(health.ocr_engines[0].name)
        }
      }

      if (health.encryption_enabled && health.encryption_key) {
        setEncryptionEnabled(health.encryption_enabled)
        setEncryptionKey(health.encryption_key)

        // Guardar keys encriptadas (se desencriptarán en el frontend cuando se necesite)
        const encryptedKeysMap: { [key: string]: string } = {}
        for (const engine of health.ocr_engines || []) {
          if (engine.api_key_encrypted) {
            encryptedKeysMap[engine.name] = engine.api_key_encrypted
            console.log(`✓ API Key encriptada de ${engine.name} cargada`)
          }
        }
        setEncryptedKeys(encryptedKeysMap)
      }
    } catch (err) {
      console.error('Error cargando motores OCR:', err)
    }
  }

  const startCamera = useCallback(async (mode: 'label' | 'photos' = 'label') => {
    try {
      setError(null)
      setCameraError(null)
      setIsVideoReady(false)
      setCameraMode(mode)

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Cámara no disponible en este dispositivo')
        return
      }

      const constraints = {
        video: {
          facingMode: 'environment',
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      setIsCameraActive(true)

      // Auto-scroll a la cámara en móvil
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)

      // Asignar stream al video
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream
          const playPromise = videoRef.current.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsVideoReady(true)
              })
              .catch(err => console.error('Video play failed:', err))
          }
        }
      }, 100)
    } catch (err: any) {
      const errorMessage =
        err.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado'
          : err.name === 'NotFoundError'
            ? 'Cámara no encontrada'
            : err.message

      setCameraError(errorMessage)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }

    setIsCameraActive(false)
    setCameraError(null)
    setIsVideoReady(false)
    setCameraMode(null)
  }, [])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current?.videoWidth || !canvasRef.current) {
      setCameraError('Cámara no lista')
      return
    }

    try {
      const context = canvasRef.current.getContext('2d')
      if (!context) return

      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight

      context.drawImage(videoRef.current, 0, 0)
      const imageBase64 = canvasRef.current.toDataURL('image/jpeg')

      if (cameraMode === 'label') {
        // Modo captura de etiqueta: extraer referencia con OCR
        if (!referencia) {
          setGeneratingReference(true)
          try {
            const imageBase64Clean = imageBase64.split(',')[1]

            // Procesar imagen con OCR del frontend (Claude → OpenAI)
            const response = await processImageWithOCR(
              imageBase64Clean,
              encryptedKeys['claude'],
              encryptedKeys['openai'],
              encryptionKey
            )

            if (response.success && response.code) {
              setReferencia(response.code)
              console.log(`✓ Código extraído con ${response.engine}: ${response.code}`)
            } else {
              console.error('OCR Error:', response.error)
              setError(response.error || 'No se pudo extraer el código de la imagen')
            }
          } catch (err) {
            console.error('Error generating reference:', err)
            setError('Error al procesar la imagen')
          } finally {
            setGeneratingReference(false)
          }
        }
        stopCamera()
      } else if (cameraMode === 'photos') {
        // Modo captura de fotos adicionales
        setImagenes(prev => [...prev, imageBase64])
        stopCamera()
      }
    } catch (err) {
      console.error('Capture error:', err)
      setCameraError('Error al capturar foto')
    }
  }, [referencia, cameraMode])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageBase64 = (e.target?.result as string) || ''
      setImagenes(prev => [...prev, imageBase64])

      // Intentar extraer referencia con OCR si no la tenemos
      if (!referencia) {
        setGeneratingReference(true)
        try {
          const imageBase64Clean = imageBase64.split(',')[1]

          // Procesar imagen con OCR del frontend (Claude → OpenAI)
          const response = await processImageWithOCR(
            imageBase64Clean,
            encryptedKeys['claude'],
            encryptedKeys['openai'],
            encryptionKey
          )

          if (response.success && response.code) {
            setReferencia(response.code)
            console.log(`✓ Código extraído con ${response.engine}: ${response.code}`)
          } else {
            console.error('OCR Error:', response.error)
          }
        } catch (err) {
          console.error('Error generating reference:', err)
        } finally {
          setGeneratingReference(false)
        }
      }

      // Limpiar input
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }, [referencia])

  const removeImage = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index))
  }

  const confirmReference = async () => {
    if (!referencia.trim()) {
      setError('Por favor ingresa una referencia')
      return
    }

    setReferenceCheckStatus({ loading: true, exists: false })
    try {
      const result = await checkReference(referencia.trim())
      setReferenceCheckStatus({
        loading: false,
        exists: result.exists,
        count: result.count,
        total_quantity: result.total_quantity,
      })
      setReferenciaConfirmed(true)
      setStep('photos')
    } catch (err) {
      console.error('Error checking reference:', err)
      setError('Error al verificar referencia')
    }
  }

  const proceedToDetails = () => {
    if (imagenes.length === 0) {
      setError('Se requiere al menos una foto')
      return
    }

    setError(null)
    setStep('details')
  }

  const submitEntry = async () => {
    if (!referencia.trim() || !fabricante.trim() || !operario.trim()) {
      setError('Por favor completa todos los campos requeridos')
      return
    }

    const finalFabricante = fabricante === 'new' ? nuevoFabricante.trim() : fabricante

    if (!finalFabricante) {
      setError('Por favor especifica un fabricante')
      return
    }

    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const entry: WarehouseEntry = {
        referencia: referencia.trim(),
        fabricante: finalFabricante,
        cantidad,
        operario: operario.trim(),
        observaciones: observaciones.trim(),
        imagenes,
      }

      const response = await createEntry(entry)

      if (response.success) {
        setStep('success')
        // Reset del formulario después de 2 segundos
        setTimeout(() => {
          resetForm()
        }, 2000)
      } else {
        setError(response.message || 'Error al guardar la entrada')
      }
    } catch (err: any) {
      console.error('Error submitting entry:', err)
      setError('Error al guardar la entrada: ' + (err.message || 'Error desconocido'))
      setErrorDetails({
        success: false,
        message: err.message || 'Error desconocido',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep('scan')
    setReferencia('')
    setReferenciaConfirmed(false)
    setFabricante('')
    setNuevoFabricante('')
    setCantidad(1)
    setOperario('')
    setObservaciones('')
    setImagenes([])
    setError(null)
    setErrorDetails(null)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  // Paso 1: Escanear etiqueta
  if (step === 'scan') {
    // Si está activa la cámara en modo etiqueta, mostrar visor
    if (isCameraActive && cameraMode === 'label') {
      return (
        <div ref={containerRef} className="w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden">
          <div className="bg-gray-900 text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold text-sm">Capturar Etiqueta</h3>
            <button onClick={stopCamera} className="text-xl hover:text-red-400 transition">
              ✕
            </button>
          </div>

          {cameraError && (
            <div className="bg-red-600 text-white p-3 text-center font-semibold text-sm">{cameraError}</div>
          )}

          <div
            className="relative w-full bg-black flex items-center justify-center overflow-hidden"
            style={{ height: '40vh' }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              disablePictureInPicture
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {!isVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <p className="text-white text-center">Inicializando cámara...</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="bg-gray-900 text-white p-3 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={capturePhoto}
                disabled={!isVideoReady || generatingReference}
                className="flex-1 py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold text-sm disabled:bg-gray-400"
              >
                📸 {generatingReference ? 'Procesando...' : 'Capturar'}
              </button>
              <button
                onClick={stopCamera}
                className="flex-1 py-2 px-3 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold text-sm"
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div ref={containerRef} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">📦 Entrada de Almacén</h2>
          <p className="text-sm text-blue-800">
            Captura una foto de la etiqueta de referencia o ingresa manualmente
          </p>
        </div>

        {error && (
          <div
            onClick={() => setShowErrorModal(true)}
            className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm cursor-pointer hover:bg-red-100 transition space-y-2"
          >
            <div className="font-semibold">❌ {error}</div>
            <div className="text-xs text-red-600">
              🔍 Haz click aquí para ver detalles completos
            </div>
          </div>
        )}

        <div className="space-y-3">
          {availableEngines.length > 0 && (
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Motor OCR</span>
              <select
                value={ocrEngine}
                onChange={(e) => setOcrEngine(e.target.value)}
                disabled={generatingReference}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {availableEngines.map((engine) => (
                  <option key={engine.name} value={engine.name}>
                    {engine.name === 'tesseract' && '🔤 Tesseract (Gratis)'}
                    {engine.name === 'easyocr' && '🔍 EasyOCR (Gratis)'}
                    {engine.name === 'openai' && '🤖 OpenAI Vision'}
                    {engine.name === 'claude' && '🧠 Claude Vision'}
                  </option>
                ))}
              </select>

              {/* Indicador de estado de API key */}
              {(ocrEngine === 'openai' || ocrEngine === 'claude') && (
                <div className="mt-2 text-xs flex items-center gap-1">
                  {encryptedKeys[ocrEngine] ? (
                    <span className="text-green-600 font-semibold">✓ API Key configurada</span>
                  ) : (
                    <span className="text-red-600 font-semibold">⚠️ API Key no configurada</span>
                  )}
                </div>
              )}
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium text-gray-700">Referencia *</span>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              placeholder="Ej: M8x20-INOX"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </label>

          <button
            onClick={() => startCamera('label')}
            disabled={generatingReference}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400"
          >
            📷 {generatingReference ? 'Procesando...' : 'Capturar Etiqueta'}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            📁 Seleccionar Foto
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={confirmReference}
            disabled={!referencia.trim() || referenceCheckStatus.loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
          >
            {referenceCheckStatus.loading ? 'Verificando...' : 'Confirmar Referencia'}
          </button>

          {referenceCheckStatus.exists && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm font-semibold text-yellow-900">⚠️ Referencia Existente</div>
              <div className="text-xs text-yellow-800 mt-1">
                Esta referencia ya tiene {referenceCheckStatus.count} entrada(s) con {referenceCheckStatus.total_quantity} unidades registradas
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Paso 2: Capturar fotos adicionales
  if (step === 'photos') {
    if (isCameraActive) {
      return (
        <div ref={containerRef} className="w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden">
          <div className="bg-gray-900 text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold text-sm">Capturar Fotos</h3>
            <button onClick={stopCamera} className="text-xl hover:text-red-400 transition">
              ✕
            </button>
          </div>

          {cameraError && (
            <div className="bg-red-600 text-white p-3 text-center font-semibold text-sm">{cameraError}</div>
          )}

          <div
            className="relative w-full bg-black flex items-center justify-center overflow-hidden"
            style={{ height: '40vh' }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              disablePictureInPicture
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {!isVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <p className="text-white text-center">Inicializando cámara...</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="bg-gray-900 text-white p-3 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={capturePhoto}
                disabled={!isVideoReady || generatingReference}
                className="flex-1 py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold text-sm disabled:bg-gray-400"
              >
                📸 {generatingReference ? 'Procesando...' : 'Capturar'}
              </button>
              <button
                onClick={stopCamera}
                className="flex-1 py-2 px-3 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold text-sm"
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div ref={containerRef} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">📸 Capturar Fotos</h2>
          <p className="text-sm text-blue-800">Captura una o más fotos de la pieza ({imagenes.length}/10)</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <div className="font-semibold">❌ {error}</div>
          </div>
        )}

        {imagenes.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {imagenes.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img}
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-24 object-cover rounded border border-gray-200"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={() => startCamera('photos')}
            className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            📷 Capturar Foto
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            📁 Seleccionar Foto
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={proceedToDetails}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Continuar →
          </button>

          <button
            onClick={() => setStep('scan')}
            className="w-full py-2 px-4 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-semibold"
          >
            ← Atrás
          </button>
        </div>
      </div>
    )
  }

  // Paso 3: Detalles de entrada
  if (step === 'details') {
    return (
      <div ref={containerRef} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold text-blue-900 mb-2">📝 Detalles de Entrada</h2>
          <p className="text-sm text-blue-800">Completa la información de la entrada</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <div className="font-semibold">❌ {error}</div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Referencia *</label>
            <input
              type="text"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fabricante *</label>
            <select
              value={fabricante}
              onChange={(e) => {
                setFabricante(e.target.value)
                setNuevoFabricante('')
              }}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Seleccionar fabricante...</option>
              {manufacturers.map(mfg => (
                <option key={mfg} value={mfg}>
                  {mfg}
                </option>
              ))}
              <option value="new">+ Agregar nuevo</option>
            </select>
          </div>

          {fabricante === 'new' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nuevo Fabricante *</label>
              <input
                type="text"
                value={nuevoFabricante}
                onChange={(e) => setNuevoFabricante(e.target.value)}
                placeholder="Nombre del fabricante"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Cantidad *</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Operario *</label>
            <input
              type="text"
              value={operario}
              onChange={(e) => setOperario(e.target.value)}
              placeholder="Tu nombre"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones opcionales..."
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={submitEntry}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              ✓ Guardar Entrada
            </button>

            <button
              onClick={() => setStep('photos')}
              className="w-full py-2 px-4 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-semibold"
            >
              ← Atrás
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Paso 4: Éxito
  if (step === 'success') {
    return (
      <div ref={containerRef} className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="font-semibold text-green-900 mb-2">¡Entrada Guardada!</h2>
          <p className="text-sm text-green-800 mb-4">
            La entrada ha sido registrada correctamente en el almacén
          </p>
          <div className="bg-white p-3 rounded text-left text-sm text-gray-700 space-y-1">
            <p>
              <strong>Referencia:</strong> {referencia}
            </p>
            <p>
              <strong>Fabricante:</strong> {fabricante === 'new' ? nuevoFabricante : fabricante}
            </p>
            <p>
              <strong>Cantidad:</strong> {cantidad}
            </p>
            <p>
              <strong>Fotos:</strong> {imagenes.length}
            </p>
          </div>
        </div>

        <button
          onClick={resetForm}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          ➕ Nueva Entrada
        </button>
      </div>
    )
  }

  return null
}
