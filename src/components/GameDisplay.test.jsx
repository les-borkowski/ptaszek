import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi } from 'vitest'
import { GameDisplay } from './GameDisplay'

const mockWord = { word: 'kwadrat', emoji: '🟥', translation: 'square' }

const defaultProps = {
  word: mockWord,
  score: 0,
  status: 'listening',
  celebration: null,
  learnMode: false,
  onLearnModeChange: () => {},
  showTranslation: false,
  onShowTranslationChange: () => {},
  onSpeak: () => {},
}

describe('GameDisplay (cut-paper)', () => {
  test('renders the current word illustration', () => {
    render(<GameDisplay {...defaultProps} />)
    expect(screen.getByAltText('kwadrat')).toBeInTheDocument()
  })

  test('renders the current word label', () => {
    render(<GameDisplay {...defaultProps} />)
    expect(screen.getByText('kwadrat')).toBeInTheDocument()
  })

  test('renders the POSTĘP heading', () => {
    render(<GameDisplay {...defaultProps} score={5} />)
    expect(screen.getByText(/POSTĘP/)).toBeInTheDocument()
  })

  test('shows the listening prompt bubble', () => {
    render(<GameDisplay {...defaultProps} status="listening" />)
    expect(screen.getByText(/Powiedz słowo/i)).toBeInTheDocument()
  })

  test('shows Brawo bubble when status is correct', () => {
    render(<GameDisplay {...defaultProps} status="correct" />)
    expect(screen.getByText(/Brawo!/i)).toBeInTheDocument()
  })

  test('shows retry bubble when status is incorrect', () => {
    render(<GameDisplay {...defaultProps} status="incorrect" />)
    expect(screen.getByText(/Spróbuj jeszcze raz/i)).toBeInTheDocument()
  })

  test('applies status-<value> class to the word-area wrapper', () => {
    const { container, rerender } = render(<GameDisplay {...defaultProps} status="listening" />)
    expect(container.querySelector('.word-area')).toHaveClass('status-listening')

    rerender(<GameDisplay {...defaultProps} status="correct" />)
    expect(container.querySelector('.word-area')).toHaveClass('status-correct')

    rerender(<GameDisplay {...defaultProps} status="incorrect" />)
    expect(container.querySelector('.word-area')).toHaveClass('status-incorrect')
  })

  test('renders a speaker (mic) button', () => {
    render(<GameDisplay {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Wymów słowo/i })).toBeInTheDocument()
  })

  test('calls onSpeak when speaker button is clicked', async () => {
    const onSpeak = vi.fn()
    render(<GameDisplay {...defaultProps} onSpeak={onSpeak} />)
    await userEvent.click(screen.getByRole('button', { name: /Wymów słowo/i }))
    expect(onSpeak).toHaveBeenCalledTimes(1)
  })

  test('renders learn-mode toggle reflecting prop value', () => {
    const learnToggle = { name: /Tryb nauki/i }
    const { rerender } = render(<GameDisplay {...defaultProps} learnMode={false} />)
    expect(screen.getByRole('checkbox', learnToggle)).not.toBeChecked()

    rerender(<GameDisplay {...defaultProps} learnMode={true} />)
    expect(screen.getByRole('checkbox', learnToggle)).toBeChecked()
  })

  test('calls onLearnModeChange(true) when unchecked toggle is clicked', async () => {
    const onChange = vi.fn()
    render(<GameDisplay {...defaultProps} learnMode={false} onLearnModeChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /Tryb nauki/i }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  test('does not render the English translation when showTranslation is false', () => {
    render(<GameDisplay {...defaultProps} showTranslation={false} />)
    expect(screen.getByText('square').parentElement).toHaveStyle({ opacity: 0 })
  })

  test('renders the English translation under the word when showTranslation is true', () => {
    render(<GameDisplay {...defaultProps} showTranslation={true} />)
    expect(screen.getByText('square').parentElement).toHaveStyle({ opacity: 1 })
  })

  test('renders translation toggle reflecting prop value', () => {
    const enToggle = { name: /tłumaczenie/i }
    const { rerender } = render(<GameDisplay {...defaultProps} showTranslation={false} />)
    expect(screen.getByRole('checkbox', enToggle)).not.toBeChecked()

    rerender(<GameDisplay {...defaultProps} showTranslation={true} />)
    expect(screen.getByRole('checkbox', enToggle)).toBeChecked()
  })

  test('calls onShowTranslationChange(true) when unchecked EN toggle is clicked', async () => {
    const onChange = vi.fn()
    render(<GameDisplay {...defaultProps} showTranslation={false} onShowTranslationChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox', { name: /tłumaczenie/i }))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  test('renders chain ring counter when score >= 5', () => {
    render(<GameDisplay {...defaultProps} score={7} />)
    expect(screen.getByText(/×1/)).toBeInTheDocument()
  })

  test('does not render a milestone hint badge', () => {
    render(<GameDisplay {...defaultProps} score={2} />)
    expect(screen.queryByText(/Następny etap/i)).not.toBeInTheDocument()
  })

  test('renders a Skip button in the footer that calls onSkip when clicked', async () => {
    const onSkip = vi.fn()
    const { container } = render(<GameDisplay {...defaultProps} onSkip={onSkip} />)
    const footer = container.querySelector('.game-footer')
    const skipBtn = screen.getByRole('button', { name: /Pomiń słowo/i })
    expect(footer).toContainElement(skipBtn)
    await userEvent.click(skipBtn)
    expect(onSkip).toHaveBeenCalledTimes(1)
  })

  test('renders a back button that calls onBack when clicked', async () => {
    const onBack = vi.fn()
    render(<GameDisplay {...defaultProps} onBack={onBack} />)
    const btn = screen.getByRole('button', { name: /Wróć do menu/i })
    expect(btn).toBeInTheDocument()
    await userEvent.click(btn)
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  test('adds the listening-ring class to the mic button when isListening is true', () => {
    const { rerender } = render(<GameDisplay {...defaultProps} isListening={false} />)
    expect(screen.getByRole('button', { name: /Wymów słowo/i })).not.toHaveClass('paper-mic--listening')

    rerender(<GameDisplay {...defaultProps} isListening={true} />)
    expect(screen.getByRole('button', { name: /Wymów słowo/i })).toHaveClass('paper-mic--listening')
  })
})
