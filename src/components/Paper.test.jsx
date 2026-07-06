import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { WordImage } from './Paper'

describe('WordImage', () => {
  test('renders plain art (not emoji) once the PNG fails to load, for a plain-art category', () => {
    const word = { word: 'sto', translation: '100', emoji: '💯', category: 'numbers' }
    render(<WordImage word={word} size={100} />)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.queryByText('💯')).not.toBeInTheDocument()
  })

  test('falls back to emoji once the PNG fails to load, for a non-plain-art category', () => {
    const word = { word: 'kot', translation: 'cat', emoji: '🐱', category: 'domestic_animals' }
    render(<WordImage word={word} size={100} />)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByText('🐱')).toBeInTheDocument()
  })
})
