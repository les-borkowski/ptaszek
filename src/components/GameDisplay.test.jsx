import { render, screen } from '@testing-library/react'
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
})
