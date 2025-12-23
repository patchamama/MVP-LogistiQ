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
        streamRef.current = null
      }
    }
  }, [])

  // Handle video play when camera becomes active
  useEffect(() => {
    if (!isCameraActive || !videoRef.current) return

    const video = videoRef.current
    const playVideo = async () => {
      try {
        // Ensure video is ready
        if (video.srcObject && video.readyState >= 2) {
          await video.play()
          console.log('Video playback started')
        } else {
          // Wait a bit and try again
          setTimeout(() => {
            video.play().catch(err => console.error('Play error:', err))
          }, 200)
        }
      } catch (err) {
        console.error('Video play error:', err)
        setCameraError('Failed to play video')
      }
    }

    playVideo()

    // Listen for canplay event as backup
    const handleCanPlay = () => {
      console.log('Video ready to play')
      video.play().catch(err => console.error('Play on canplay error:', err))
    }

    video.addEventListener('canplay', handleCanPlay)
    return () => video.removeEventListener('canplay', handleCanPlay)
  }, [isCameraActive])

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setCameraError(null)
      console.log('Starting camera...')

      // Check if device supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const msg = 'Camera not supported on this device'
        setCameraError(msg)
        console.error(msg)
        return
      }

      // Try with basic constraints first
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { min: 320, ideal: 1280, max: 1920 },
          height: { min: 240, ideal: 720, max: 1080 }
        },
        audio: false
      }

      console.log('Requesting camera with constraints:', constraints)
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Stream obtained:', stream)

      streamRef.current = stream

      if (videoRef.current) {
        console.log('Setting video srcObject')
        videoRef.current.srcObject = stream

        // Set the state after srcObject is set
        setIsCameraActive(true)
        console.log('Camera state set to active')
      } else {
        console.error('Video ref is null')
        setCameraError('Video element not ready')
      }
    } catch (err) {
      const error = err as CameraError
      console.error('Camera error details:', error)

      const errorMessage = error.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access in settings.'
        : error.name === 'NotFoundError'
        ? 'No camera found on this device'
        : error.name === 'SecurityError'
        ? 'Camera access requires HTTPS'
        : error.message || 'Unknown camera error'

      setCameraError(errorMessage)
    }
  }, [])

  const stopCamera = useCallback(() => {
    console.log('Stopping camera...')

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.kind)
        track.stop()
      })
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.srcObject = null
    }

    setIsCameraActive(false)
    setCameraError(null)
    console.log('Camera stopped')
  }, [])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      setCameraError('Camera or canvas not ready')
      return
    }

    try {
      const context = canvasRef.current.getContext('2d')
      if (!context) {
        setCameraError('Could not get canvas context')
        return
      }

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
    } catch (err) {
      console.error('Capture error:', err)
      setCameraError('Failed to capture photo')
      setIsLoading(false)
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
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center h-16">
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
        <div className="bg-red-600 text-white p-4 text-center font-semibold text-sm">
          {cameraError}
        </div>
      )}

      {/* Video Feed - 3/4 of screen */}
      <div className="flex-1 bg-black relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)',
            WebkitTransform: 'scaleX(-1)',
          } as React.CSSProperties}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls - 1/4 of screen */}
      <div className="bg-gray-900 text-white p-4 space-y-3 h-auto">
        {/* Engine Selector */}
        <div className="flex gap-2">
          <label className="text-sm font-medium flex items-center whitespace-nowrap">{t('camera.ocrEngine')}</label>
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
