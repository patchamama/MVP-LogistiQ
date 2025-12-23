import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../../components/LoadingSpinner'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        loading: 'Processing image...'
      }
      return translations[key] || key
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en'
    }
  })
}))

describe('LoadingSpinner', () => {
  it('should render spinner component', () => {
    render(<LoadingSpinner />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should display loading text', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Processing image...')).toBeInTheDocument()
  })

  it('should have correct styling classes', () => {
    const { container } = render(<LoadingSpinner />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center')
  })
})
