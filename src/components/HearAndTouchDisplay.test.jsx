import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { HearAndTouchDisplay } from './HearAndTouchDisplay'

const mockWord   = { word: 'pies', emoji: '🐶' }
const mockOptions = [
  { word: 'pies',  emoji: '🐶' },
  { word: 'kot',   emoji: '🐱' },
  { word: 'ryba',  emoji: '🐟' },
  { word: 'ptak',  emoji: '🐦' },
]
const defaultProps = {
  word: mockWord,
  options: mockOptions,
  score: 0,
  status: 'listening',
  celebration: null,
  onSelect: () => {},
  onBack: () => {},
}

describe('HearAndTouchDisplay', () => {
  test('renders the mode title', () => {
    render(<HearAndTouchDisplay {...defaultProps} />)
    expect(screen.getByText(/Usłysz i dotknij/i)).toBeInTheDocument()
  })

  test('renders PaperChain score progress', () => {
    render(<HearAndTouchDisplay {...defaultProps} score={5} />)
    expect(screen.getByText(/POSTĘP/i)).toBeInTheDocument()
  })

  test('renders a back button that calls onBack', async () => {
    const onBack = vi.fn()
    render(<HearAndTouchDisplay {...defaultProps} onBack={onBack} />)
    await userEvent.click(screen.getByRole('button', { name: /Wróć do menu/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  test('renders four emoji cards', () => {
    render(<HearAndTouchDisplay {...defaultProps} />)
    const cards = screen.getAllByRole('button').filter(b => b.classList.contains('hat-card'))
    expect(cards).toHaveLength(4)
  })

  test('shows listening prompt when status is listening', () => {
    render(<HearAndTouchDisplay {...defaultProps} status="listening" />)
    expect(screen.getByText(/Dotknij właściwy obrazek/i)).toBeInTheDocument()
  })

  test('calls onSelect when a card is clicked', async () => {
    const onSelect = vi.fn()
    render(<HearAndTouchDisplay {...defaultProps} onSelect={onSelect} />)
    const cards = screen.getAllByRole('button').filter(b => b.classList.contains('hat-card'))
    await userEvent.click(cards[0])
    expect(onSelect).toHaveBeenCalledTimes(1)
  })
})
