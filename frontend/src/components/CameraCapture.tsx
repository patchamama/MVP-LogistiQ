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
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setCameraError(null)
      setIsVideoReady(false)
      console.log('Starting camera...')

      if (!navigator.mediaDevices?.getUserMedia) {
        const msg = 'Camera not supported on this device'
        setCameraError(msg)
        console.error(msg)
        return
      }

      // Simple constraints - just request video
      const constraints = {
        video: {
          facingMode: 'environment'
        },
        audio: false
      }

      console.log('Requesting camera...')
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Stream obtained:', stream)

      streamRef.current = stream

      // Set camera active first
      setIsCameraActive(true)

      // Then set the stream with a small delay
      setTimeout(() => {
        if (videoRef.current && stream) {
          console.log('Setting srcObject...')
          videoRef.current.srcObject = stream

          // Try to play
          const playPromise = videoRef.current.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Video is playing')
                setIsVideoReady(true)
              })
              .catch(err => console.error('Play failed:', err))
          }
        }
      }, 100)
    } catch (err) {
      const error = err as CameraError
      console.error('Camera error:', error)

      const errorMessage = error.name === 'NotAllowedError'
        ? 'Camera permission denied'
        : error.name === 'NotFoundError'
        ? 'No camera found'
        : error.message

      setCameraError(errorMessage)
    }
  }, [])

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...')

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
  }, [])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current?.videoWidth || !canvasRef.current) {
      setCameraError('Camera not ready')
      return
    }

    try {
      const context = canvasRef.current.getContext('2d')
      if (!context) return

      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight

      // Draw the video frame directly without mirroring
      context.drawImage(videoRef.current, 0, 0)

      const imageBase64 = canvasRef.current.toDataURL('image/jpeg')

      // Close camera and show captured image
      stopCamera()
      setCapturedImage(imageBase64)

      setIsLoading(true)
      setError(null)

      const response = await processImage(imageBase64.split(',')[1], ocrEngine)
      setResult(response)

      if (!response.success) {
        setError(response.message || null)
        // Wait 3 seconds before clearing the image on error
        setTimeout(() => {
          setCapturedImage(null)
        }, 3000)
      }
    } catch (err) {
      console.error('Capture error:', err)
      const errorMsg = 'Failed to capture photo'
      setError(errorMsg)
      // Wait 3 seconds before clearing the image on error
      setTimeout(() => {
        setCapturedImage(null)
      }, 3000)
    } finally {
      setIsLoading(false)
    }
  }, [ocrEngine])

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

      if (!response.success) {
        setError(response.message || null)
      }
      setIsLoading(false)
    }
    reader.readAsDataURL(file)
  }, [ocrEngine])

  const resetCapture = useCallback(() => {
    setResult(null)
    setError(null)
    setCapturedImage(null)
    setIsCameraActive(false)
  }, [])

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (result?.success) {
    return <ProductResult result={result} onReset={resetCapture} />
  }

  // Show captured image with error message if capture failed
  if (capturedImage && !result?.success) {
    return (
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden">
          <div className="bg-gray-900 text-white p-3">
            <h3 className="font-semibold text-sm">{t('camera.capturedImage')}</h3>
          </div>
          <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="bg-gray-900 text-white p-3">
            <div className="flex gap-2">
              <button
                onClick={resetCapture}
                className="flex-1 py-2 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold text-sm"
              >
                🔄 {t('camera.retry')}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isCameraActive) {
    // Controls view
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

  // Camera active view
  return (
    <div className="w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden">
      {/* Camera Header */}
      <div className="bg-gray-900 text-white p-3 flex justify-between items-center">
        <h3 className="font-semibold text-sm">{t('camera.title')}</h3>
        <button
          onClick={stopCamera}
          className="text-xl hover:text-red-400 transition"
        >
          ✕
        </button>
      </div>

      {/* Camera Error */}
      {cameraError && (
        <div className="bg-red-600 text-white p-3 text-center font-semibold text-sm">
          {cameraError}
        </div>
      )}

      {/* Video Container */}
      <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
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
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white text-center">Initializing camera...</p>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls Footer */}
      <div className="bg-gray-900 text-white p-3 space-y-2">
        {/* Engine Selector */}
        <div className="flex gap-2 text-sm">
          <label className="whitespace-nowrap flex items-center">{t('camera.ocrEngine')}</label>
          <select
            value={ocrEngine}
            onChange={(e) => setOcrEngine(e.target.value as any)}
            className="flex-1 px-2 py-1 border border-gray-600 rounded text-xs bg-gray-800 text-white"
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
            className="flex-1 py-2 px-3 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold text-sm"
          >
            📸 {t('camera.capture')}
          </button>
          <button
            onClick={stopCamera}
            className="flex-1 py-2 px-3 bg-red-600 text-white rounded hover:bg-red-700 transition font-semibold text-sm"
          >
            ✕ {t('camera.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
