import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { CategoriesModal } from './CategoriesModal'

const mockCategories = [
  { id: 'shapes', label: 'Kształty', emoji: '🔺' },
  { id: 'colours', label: 'Kolory', emoji: '🎨' },
]

describe('CategoriesModal', () => {
  test('renders all categories', () => {
    render(<CategoriesModal categories={mockCategories} selected={null} onClose={() => {}} onChange={() => {}} />)
    expect(screen.getByText('Kształty')).toBeInTheDocument()
    expect(screen.getByText('Kolory')).toBeInTheDocument()
  })

  test('calls onChange(null) when "Wszystkie" is clicked', async () => {
    const onChange = vi.fn()
    render(<CategoriesModal categories={mockCategories} selected={['shapes']} onClose={() => {}} onChange={onChange} />)
    fireEvent.click(screen.getByText('Wszystkie'))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  test('calls onChange([]) when "Żadne" is clicked', async () => {
    const onChange = vi.fn()
    render(<CategoriesModal categories={mockCategories} selected={null} onClose={() => {}} onChange={onChange} />)
    fireEvent.click(screen.getByText('Żadne'))
    expect(onChange).toHaveBeenCalledWith([])
  })

  test('renders a dialog with an accessible name', () => {
    render(<CategoriesModal categories={mockCategories} selected={null} onClose={() => {}} onChange={() => {}} />)
    expect(screen.getByRole('dialog', { name: 'Kategorie' })).toBeInTheDocument()
  })

  test('focuses the first focusable element on mount', () => {
    render(<CategoriesModal categories={mockCategories} selected={null} onClose={() => {}} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: '✕' })).toHaveFocus()
  })

  test('pressing Escape calls onClose', () => {
    const onClose = vi.fn()
    render(<CategoriesModal categories={mockCategories} selected={null} onClose={onClose} onChange={() => {}} />)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('Tab from the last focusable element wraps to the first', () => {
    render(<CategoriesModal categories={mockCategories} selected={null} onClose={() => {}} onChange={() => {}} />)
    const dialog = screen.getByRole('dialog')
    const closeBtn = screen.getByRole('button', { name: '✕' })
    const doneBtn = screen.getByRole('button', { name: 'Gotowe!' })

    doneBtn.focus()
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(closeBtn).toHaveFocus()
  })

  test('Shift+Tab from the first focusable element wraps to the last', () => {
    render(<CategoriesModal categories={mockCategories} selected={null} onClose={() => {}} onChange={() => {}} />)
    const dialog = screen.getByRole('dialog')
    const closeBtn = screen.getByRole('button', { name: '✕' })
    const doneBtn = screen.getByRole('button', { name: 'Gotowe!' })

    closeBtn.focus()
    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(doneBtn).toHaveFocus()
  })

  test('clicking outside the card (overlay) calls onClose', () => {
    const onClose = vi.fn()
    const { container } = render(<CategoriesModal categories={mockCategories} selected={null} onClose={onClose} onChange={() => {}} />)
    fireEvent.click(container.querySelector('.modal-overlay'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
