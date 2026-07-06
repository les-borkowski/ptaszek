import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import { PlainWordArt } from './PlainWordArt'

describe('PlainWordArt', () => {
  test('renders the numeral text for a numbers-category word', () => {
    const word = { word: 'sto', translation: '100', emoji: '💯', category: 'numbers' }
    render(<PlainWordArt word={word} size={100} />)
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  test('renders a coloured circle for a colours-category word', () => {
    const word = { word: 'czerwony', translation: 'red', emoji: '🔴', category: 'colours' }
    const { container } = render(<PlainWordArt word={word} size={100} />)
    const circle = container.querySelector('[style*="border-radius"]')
    expect(circle).not.toBeNull()
    expect(circle.style.background).not.toBe('')
  })

  test('renders an SVG shape for a shapes-category word', () => {
    const word = { word: 'koło', translation: 'circle', emoji: '⭕', category: 'shapes' }
    const { container } = render(<PlainWordArt word={word} size={100} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  test('falls back to the circle renderer for an unmapped shape name', () => {
    const word = { word: 'nieznany', translation: 'unknown-shape', emoji: '❔', category: 'shapes' }
    const { container } = render(<PlainWordArt word={word} size={100} />)
    expect(container.querySelector('svg circle')).toBeInTheDocument()
  })
})
