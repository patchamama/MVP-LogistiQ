import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductResult from '../../components/ProductResult'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'error': 'Error',
        'actions.tryAgain': 'Try again',
        'ocr.title': 'OCR Data',
        'ocr.engine': 'Engine',
        'ocr.rawText': 'Raw Text',
        'ocr.filteredCode': 'Filtered Code',
        'product.title': 'Product Information',
        'product.code': 'Code',
        'product.name': 'Name',
        'product.description': 'Description',
        'product.category': 'Category',
        'product.price': 'Price',
        'product.stock': 'Stock',
        'product.units': 'units',
        'product.locations': 'Locations',
        'product.supplier': 'Supplier',
        'actions.scanAnother': 'Scan another product'
      }
      return translations[key] || key
    }
  })
}))

describe('ProductResult', () => {
  const mockProduct = {
    code: '12345',
    name: 'Tornillo M8x20',
    description: 'Tornillo métrico',
    price: 0.50,
    stock: 150,
    locations: ['Estantería A-3'],
    supplier: 'Proveedor A',
    category: 'Tornillería'
  }

  const mockReset = vi.fn()

  it('should display error message when success is false', () => {
    const result = {
      success: false,
      message: 'Product not found'
    }

    render(<ProductResult result={result} onReset={mockReset} />)

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Product not found')).toBeInTheDocument()
  })

  it('should display product information when success is true', () => {
    const result = {
      success: true,
      product: mockProduct,
      ocr_result: {
        raw_text: '12345ABC',
        filtered_code: '12345',
        engine_used: 'tesseract'
      }
    }

    render(<ProductResult result={result} onReset={mockReset} />)

    expect(screen.getByText('Product Information')).toBeInTheDocument()
    expect(screen.getByText('Tornillo M8x20')).toBeInTheDocument()
    expect(screen.getByText('€0.50')).toBeInTheDocument()
  })

  it('should display OCR data when available', () => {
    const result = {
      success: true,
      product: mockProduct,
      ocr_result: {
        raw_text: '12345ABC',
        filtered_code: '12345',
        engine_used: 'tesseract'
      }
    }

    render(<ProductResult result={result} onReset={mockReset} />)

    expect(screen.getByText('OCR Data')).toBeInTheDocument()
    expect(screen.getByText('tesseract')).toBeInTheDocument()
  })

  it('should call onReset when reset button is clicked', () => {
    const result = {
      success: true,
      product: mockProduct,
      ocr_result: undefined
    }

    render(<ProductResult result={result} onReset={mockReset} />)

    const resetButton = screen.getByText('Scan another product')
    fireEvent.click(resetButton)

    expect(mockReset).toHaveBeenCalled()
  })

  it('should display product locations', () => {
    const result = {
      success: true,
      product: mockProduct,
      ocr_result: undefined
    }

    render(<ProductResult result={result} onReset={mockReset} />)

    expect(screen.getByText('Estantería A-3')).toBeInTheDocument()
  })
})
