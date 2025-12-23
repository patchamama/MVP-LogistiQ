import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { processImage } from '../services/api'
import { APIResponse, CameraError } from '../types/product'
import LoadingSpinner from './LoadingSpinner'
import ProductResult from './ProductResult'

export default function CameraCapture() {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<APIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ocrEngine, setOcrEngine] = useState<'tesseract' | 'easyocr' | 'both'>('tesseract')

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (err) {
      const error = err as CameraError
      setError(`${t('camera.title')}: ${error.message}`)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setIsCameraActive(false)
  }, [])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')
    if (!context) return

    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    const imageBase64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1]

    setIsLoading(true)
    setError(null)

    const response = await processImage(imageBase64, ocrEngine)
    setResult(response)
    setIsLoading(false)

    if (response.success) {
      stopCamera()
    }
  }, [ocrEngine, stopCamera])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageBase64 = (e.target?.result as string)?.split(',')[1] || ''
      const response = await processImage(imageBase64, ocrEngine)
      setResult(response)
      setIsLoading(false)

      if (!response.success) {
        setError(response.message || null)
      }
    }
    reader.readAsDataURL(file)
  }, [ocrEngine])

  const resetCapture = useCallback(() => {
    setResult(null)
    setError(null)
    setIsCameraActive(false)
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (result?.success) {
    return <ProductResult result={result} onReset={resetCapture} />
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <label className="text-sm font-medium text-gray-700">{t('camera.ocrEngine')}</label>
        <select
          value={ocrEngine}
          onChange={(e) => setOcrEngine(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
        >
          <option value="tesseract">{t('camera.engines.tesseract')}</option>
          <option value="easyocr">{t('camera.engines.easyocr')}</option>
          <option value="both">{t('camera.engines.both')}</option>
        </select>
      </div>

      {!isCameraActive ? (
        <div className="space-y-3">
          <button
            onClick={startCamera}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            📷 {t('camera.openCamera')}
          </button>

          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              📁 {t('camera.selectImage')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-lg bg-black"
          />
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-2">
            <button
              onClick={capturePhoto}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              📸 {t('camera.capture')}
            </button>
            <button
              onClick={stopCamera}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              ✕ {t('camera.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
