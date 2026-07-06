import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { PlayerModal } from './PlayerModal'

describe('PlayerModal', () => {
  test('renders existing player chips', () => {
    render(<PlayerModal players={['Ala', 'Tomek']} current="Ala" onClose={() => {}} onSelect={() => {}} />)
    expect(screen.getByText('Ala')).toBeInTheDocument()
    expect(screen.getByText('Tomek')).toBeInTheDocument()
  })

  test('calls onSelect when a player chip is clicked', () => {
    const onSelect = vi.fn()
    render(<PlayerModal players={['Ala']} current="Ala" onClose={() => {}} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Ala'))
    expect(onSelect).toHaveBeenCalledWith('Ala')
  })

  test('renders a dialog with an accessible name', () => {
    render(<PlayerModal players={[]} current="" onClose={() => {}} onSelect={() => {}} />)
    expect(screen.getByRole('dialog', { name: 'Wybierz gracza' })).toBeInTheDocument()
  })

  test('autofocuses the name input rather than the close button', () => {
    render(<PlayerModal players={['Ala']} current="Ala" onClose={() => {}} onSelect={() => {}} />)
    expect(screen.getByPlaceholderText('Imię gracza…')).toHaveFocus()
  })

  test('Enter in the input submits the trimmed name', () => {
    const onSelect = vi.fn()
    render(<PlayerModal players={[]} current="" onClose={() => {}} onSelect={onSelect} />)
    const input = screen.getByPlaceholderText('Imię gracza…')
    fireEvent.change(input, { target: { value: '  Nowy  ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith('Nowy')
  })

  test('pressing Escape calls onClose', () => {
    const onClose = vi.fn()
    render(<PlayerModal players={[]} current="" onClose={onClose} onSelect={() => {}} />)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('clicking outside the card (overlay) calls onClose', () => {
    const onClose = vi.fn()
    const { container } = render(<PlayerModal players={[]} current="" onClose={onClose} onSelect={() => {}} />)
    fireEvent.click(container.querySelector('.modal-overlay'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
