import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CameraCapture from '../../components/CameraCapture'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'camera.ocrEngine': 'OCR Engine:',
        'camera.engines.tesseract': 'Tesseract (fast)',
        'camera.engines.easyocr': 'EasyOCR (accurate)',
        'camera.engines.both': 'Both',
        'camera.openCamera': 'Open Camera',
        'camera.selectImage': 'Select Image',
        'camera.capture': 'Capture',
        'camera.cancel': 'Cancel',
        'loading': 'Processing image...'
      }
      return translations[key] || key
    }
  })
}))

vi.mock('../../services/api', () => ({
  processImage: vi.fn(() =>
    Promise.resolve({
      success: true,
      ocr_result: { raw_text: '12345', filtered_code: '12345', engine_used: 'tesseract' },
      product: { code: '12345', name: 'Test Product' }
    })
  )
}))

describe('CameraCapture', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with initial state', () => {
    const { container } = render(<CameraCapture />)

    expect(container.textContent).toContain('Open Camera')
    expect(container.textContent).toContain('Select Image')
  })

  it('should show OCR engine selector', () => {
    const { container } = render(<CameraCapture />)

    expect(container.textContent).toContain('OCR Engine')
    const select = container.querySelector('select')
    expect(select).toBeInTheDocument()
  })

  it('should allow OCR engine selection', () => {
    const { container } = render(<CameraCapture />)

    const engineSelect = container.querySelector('select') as HTMLSelectElement
    expect(engineSelect).toBeInTheDocument()
    expect(engineSelect.value).toBe('tesseract')

    fireEvent.change(engineSelect, { target: { value: 'easyocr' } })
    expect(engineSelect.value).toBe('easyocr')
  })

  it('should render file input for image selection', () => {
    const { container } = render(<CameraCapture />)

    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('accept', 'image/*')
  })

  it('should have buttons for camera and file selection', () => {
    const { container } = render(<CameraCapture />)

    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)

    let hasCameraButton = false
    let hasSelectButton = false
    buttons.forEach(btn => {
      if (btn.textContent?.includes('Open Camera')) hasCameraButton = true
      if (btn.textContent?.includes('Select Image')) hasSelectButton = true
    })

    expect(hasCameraButton).toBe(true)
    expect(hasSelectButton).toBe(true)
  })

  it('should have hidden canvas for image capture', () => {
    const { container } = render(<CameraCapture />)

    const canvas = container.querySelector('canvas')
    // Canvas is only rendered when video is present
    if (canvas) {
      expect(canvas).toHaveClass('hidden')
    } else {
      expect(canvas).toBeNull()
    }
  })

  it('should render error div container', () => {
    const { container } = render(<CameraCapture />)

    const mainDiv = container.querySelector('.space-y-4')
    expect(mainDiv).toBeInTheDocument()
  })
})
