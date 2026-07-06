import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { HearAndTouchDisplay } from './HearAndTouchDisplay'

const mockWord = { word: 'pies', emoji: '🐶', translation: 'dog' }
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
  showTranslation: false,
  onShowTranslationChange: () => {},
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

  test('does not render a milestone hint badge', () => {
    render(<HearAndTouchDisplay {...defaultProps} score={2} />)
    expect(screen.queryByText(/Następny etap/i)).not.toBeInTheDocument()
  })

  test('renders a Skip button in the footer that calls onSkip when clicked', async () => {
    const onSkip = vi.fn()
    const { container } = render(<HearAndTouchDisplay {...defaultProps} onSkip={onSkip} />)
    const footer = container.querySelector('.game-footer')
    const skipBtn = screen.getByRole('button', { name: /Pomiń słowo/i })
    expect(footer).toContainElement(skipBtn)
    await userEvent.click(skipBtn)
    expect(onSkip).toHaveBeenCalledTimes(1)
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

  test('hides the word label slot (but keeps its layout space) when learn mode is off', () => {
    render(<HearAndTouchDisplay {...defaultProps} learnMode={false} />)
    const label = screen.getByText('pies').closest('.hat-word-label')
    expect(label).toHaveClass('hat-word-label--hidden')
    expect(label).toHaveAttribute('aria-hidden', 'true')
  })

  test('shows the word label above the grid when learn mode is on', () => {
    render(<HearAndTouchDisplay {...defaultProps} learnMode={true} />)
    const label = screen.getByText('pies').closest('.hat-word-label')
    expect(label).not.toHaveClass('hat-word-label--hidden')
    expect(label).toHaveAttribute('aria-hidden', 'false')
  })

  test('renders learn-mode toggle reflecting prop value', () => {
    const learnToggle = { name: /Tryb nauki/i }
    const { rerender } = render(<HearAndTouchDisplay {...defaultProps} learnMode={false} />)
    expect(screen.getByRole('checkbox', learnToggle)).not.toBeChecked()

    rerender(<HearAndTouchDisplay {...defaultProps} learnMode={true} />)
    expect(screen.getByRole('checkbox', learnToggle)).toBeChecked()
  })

  test('calls onLearnModeChange(true) when unchecked toggle is clicked', async () => {
    const onChange = vi.fn()
    render(<HearAndTouchDisplay {...defaultProps} learnMode={false} onLearnModeChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /Tryb nauki/i }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  test('does not show the translation when learn mode is on but showTranslation is off', () => {
    render(<HearAndTouchDisplay {...defaultProps} learnMode={true} showTranslation={false} />)
    expect(screen.getByText('dog').parentElement).toHaveStyle({ opacity: 0 })
  })

  test('shows the translation only when both learn mode and showTranslation are on', () => {
    render(<HearAndTouchDisplay {...defaultProps} learnMode={true} showTranslation={true} />)
    expect(screen.getByText('dog').parentElement).toHaveStyle({ opacity: 1 })
  })

  test('does not show the translation when showTranslation is on but learn mode is off', () => {
    render(<HearAndTouchDisplay {...defaultProps} learnMode={false} showTranslation={true} />)
    const label = screen.getByText('dog').closest('.hat-word-label')
    expect(label).toHaveClass('hat-word-label--hidden')
  })

  test('calls onShowTranslationChange(true) when unchecked EN toggle is clicked', async () => {
    const onChange = vi.fn()
    render(<HearAndTouchDisplay {...defaultProps} showTranslation={false} onShowTranslationChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /tłumaczenie/i }))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
