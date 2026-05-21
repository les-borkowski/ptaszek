import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameDisplay } from './GameDisplay'

const mockWord = { id: 1, polish: 'kwadrat', english: 'square', image: '🟥' }

describe('GameDisplay', () => {
  test('renders the word image emoji', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" />)
    expect(screen.getByText('🟥')).toBeInTheDocument()
  })

  test('renders the current score', () => {
    render(<GameDisplay word={mockWord} score={5} status="listening" />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  test('shows "Mów!" prompt when status is listening', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" />)
    expect(screen.getByTestId('status-indicator')).toHaveTextContent('Mów!')
  })

  test('shows "Brawo!" when status is correct', () => {
    render(<GameDisplay word={mockWord} score={1} status="correct" />)
    expect(screen.getByTestId('status-indicator')).toHaveTextContent('Brawo!')
  })

  test('shows retry message when status is incorrect', () => {
    render(<GameDisplay word={mockWord} score={0} status="incorrect" />)
    expect(screen.getByTestId('status-indicator')).toHaveTextContent('Spróbuj jeszcze raz!')
  })

  test('status-indicator has CSS class matching current status', () => {
    const { rerender } = render(<GameDisplay word={mockWord} score={0} status="listening" />)
    expect(screen.getByTestId('status-indicator')).toHaveClass('listening')

    rerender(<GameDisplay word={mockWord} score={1} status="correct" />)
    expect(screen.getByTestId('status-indicator')).toHaveClass('correct')

    rerender(<GameDisplay word={mockWord} score={0} status="incorrect" />)
    expect(screen.getByTestId('status-indicator')).toHaveClass('incorrect')
  })

  test('image-container has CSS class matching current status', () => {
    render(<GameDisplay word={mockWord} score={0} status="correct" />)
    expect(screen.getByTestId('image-container')).toHaveClass('correct')
  })

  test('renders a speaker button', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" onSpeak={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Wymów słowo/i })).toBeInTheDocument()
  })

  test('speaker button is always enabled', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" isSpeaking={true} onSpeak={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Wymów słowo/i })).toBeEnabled()
  })

  test('calls onSpeak when speaker button is clicked', async () => {
    const onSpeak = vi.fn()
    render(<GameDisplay word={mockWord} score={0} status="listening" onSpeak={onSpeak} />)
    await userEvent.click(screen.getByRole('button', { name: /Wymów słowo/i }))
    expect(onSpeak).toHaveBeenCalledTimes(1)
  })

  test('renders Podpowiedz learn-mode toggle', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" learnMode={false} onLearnModeChange={vi.fn()} />)
    expect(screen.getByLabelText(/Podpowiedz/i)).toBeInTheDocument()
  })

  test('toggle checkbox reflects learnMode=false', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" learnMode={false} onLearnModeChange={vi.fn()} />)
    expect(screen.getByLabelText(/Podpowiedz/i)).not.toBeChecked()
  })

  test('toggle checkbox reflects learnMode=true', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" learnMode={true} onLearnModeChange={vi.fn()} />)
    expect(screen.getByLabelText(/Podpowiedz/i)).toBeChecked()
  })

  test('calls onLearnModeChange(true) when unchecked toggle is clicked', async () => {
    const onChange = vi.fn()
    render(<GameDisplay word={mockWord} score={0} status="listening" learnMode={false} onLearnModeChange={onChange} />)
    await userEvent.click(screen.getByLabelText(/Podpowiedz/i))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
