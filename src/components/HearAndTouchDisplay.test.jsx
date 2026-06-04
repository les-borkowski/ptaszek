import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { HearAndTouchDisplay } from './HearAndTouchDisplay'

const mockWord = { word: 'pies', emoji: '🐶' }
const mockOptions = [
  { word: 'pies', emoji: '🐶' },
  { word: 'kot',  emoji: '🐱' },
  { word: 'ryba', emoji: '🐟' },
  { word: 'ptak', emoji: '🐦' },
]
const defaultProps = {
  word: mockWord,
  options: mockOptions,
  score: 0,
  status: 'listening',
  celebration: null,
  onSelect: () => {},
  onBack: () => {},
  onSpeak: () => {},
}

describe('HearAndTouchDisplay', () => {
  test('renders the mode title in a SpeechBubble when listening', () => {
    render(<HearAndTouchDisplay {...defaultProps} />)
    expect(screen.getByText(/Usłysz i dotknij/i)).toBeInTheDocument()
  })

  test('shows Brawo in SpeechBubble when status is correct', () => {
    render(<HearAndTouchDisplay {...defaultProps} status="correct" />)
    expect(screen.getByText(/Brawo!/i)).toBeInTheDocument()
  })

  test('shows retry message in SpeechBubble when status is incorrect', () => {
    render(<HearAndTouchDisplay {...defaultProps} status="incorrect" />)
    expect(screen.getByText(/Spróbuj jeszcze raz/i)).toBeInTheDocument()
  })

  test('renders PaperChain score progress', () => {
    render(<HearAndTouchDisplay {...defaultProps} score={5} />)
    expect(screen.getByText(/POSTĘP/i)).toBeInTheDocument()
  })

  test('renders next-milestone hint when below a milestone', () => {
    render(<HearAndTouchDisplay {...defaultProps} score={2} />)
    expect(screen.getByText(/Następny etap za 3/i)).toBeInTheDocument()
  })

  test('renders a back button that calls onBack', async () => {
    const onBack = vi.fn()
    render(<HearAndTouchDisplay {...defaultProps} onBack={onBack} />)
    await userEvent.click(screen.getByRole('button', { name: /Wróć do menu/i }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  test('renders a speaker button that calls onSpeak', async () => {
    const onSpeak = vi.fn()
    render(<HearAndTouchDisplay {...defaultProps} onSpeak={onSpeak} />)
    await userEvent.click(screen.getByRole('button', { name: /Posłuchaj słowa/i }))
    expect(onSpeak).toHaveBeenCalledTimes(1)
  })

  test('speaker button is disabled when status is correct', () => {
    render(<HearAndTouchDisplay {...defaultProps} status="correct" />)
    expect(screen.getByRole('button', { name: /Posłuchaj słowa/i })).toBeDisabled()
  })

  test('speaker button is disabled when status is incorrect', () => {
    render(<HearAndTouchDisplay {...defaultProps} status="incorrect" />)
    expect(screen.getByRole('button', { name: /Posłuchaj słowa/i })).toBeDisabled()
  })

  test('renders four emoji cards', () => {
    render(<HearAndTouchDisplay {...defaultProps} />)
    const cards = screen.getAllByRole('button').filter(b => b.classList.contains('hat-card'))
    expect(cards).toHaveLength(4)
  })

  test('calls onSelect with the correct option object when a card is clicked', async () => {
    const onSelect = vi.fn()
    render(<HearAndTouchDisplay {...defaultProps} onSelect={onSelect} />)
    const cards = screen.getAllByRole('button').filter(b => b.classList.contains('hat-card'))
    await userEvent.click(cards[0])
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(mockOptions[0])
  })
})
