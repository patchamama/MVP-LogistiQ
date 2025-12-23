import { useState, useRef, useCallback, useEffect } from 'react'
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
  const streamRef = useRef<MediaStream | null>(null)

  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<APIResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ocrEngine, setOcrEngine] = useState<'tesseract' | 'easyocr' | 'both'>('tesseract')
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setCameraError(null)

      // Check if device supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(t('camera.notSupported') || 'Camera not supported on this device')
        return
      }

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Wait a bit for the stream to be ready
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error('Play error:', err)
              setCameraError('Failed to start video playback')
            })
          }
        }, 100)

        setIsCameraActive(true)
      }
    } catch (err) {
      const error = err as CameraError
      const errorMessage = error.name === 'NotAllowedError'
        ? t('camera.permissionDenied') || 'Camera permission denied'
        : error.name === 'NotFoundError'
        ? t('camera.notFound') || 'No camera found'
        : error.message

      setCameraError(errorMessage)
      console.error('Camera error:', error)
    }
  }, [t])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
    setCameraError(null)
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

  if (!isCameraActive) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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

        <button
          onClick={startCamera}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
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
            className="w-full py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            📁 {t('camera.selectImage')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Camera Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h3 className="font-semibold">{t('camera.title')}</h3>
        <button
          onClick={stopCamera}
          className="text-2xl hover:text-red-400 transition"
        >
          ✕
        </button>
      </div>

      {/* Camera Error */}
      {cameraError && (
        <div className="bg-red-600 text-white p-4 text-center font-semibold">
          {cameraError}
        </div>
      )}

      {/* Video Feed - 3/4 of screen */}
      <div className="flex-1 flex items-center justify-center bg-black overflow-hidden relative">
        <video
          ref={videoRef}
          autoPlay={true}
          playsInline={true}
          muted={true}
          controls={false}
          className="absolute w-full h-full object-cover"
          style={{
            WebkitTransform: 'scaleX(-1)',
            transform: 'scaleX(-1)',
            WebkitAppearance: 'none',
          }}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls - 1/4 of screen */}
      <div className="bg-gray-900 text-white p-4 space-y-3">
        {/* Engine Selector */}
        <div className="flex gap-2">
          <label className="text-sm font-medium flex items-center">{t('camera.ocrEngine')}</label>
          <select
            value={ocrEngine}
            onChange={(e) => setOcrEngine(e.target.value as any)}
            className="flex-1 px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-800 text-white"
          >
            <option value="tesseract">{t('camera.engines.tesseract')}</option>
            <option value="easyocr">{t('camera.engines.easyocr')}</option>
            <option value="both">{t('camera.engines.both')}</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={capturePhoto}
            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-base"
          >
            📸 {t('camera.capture')}
          </button>
          <button
            onClick={stopCamera}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-base"
          >
            ✕ {t('camera.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
