import { describe, it, expect } from 'vitest'
import { buildDeck, getNextWord } from './wordDeck'

const mockWords = [
  { id: 1, polish: 'pies', english: 'dog', image: '🐶' },
  { id: 2, polish: 'kot', english: 'cat', image: '🐱' },
  { id: 3, polish: 'koń', english: 'horse', image: '🐴' },
]

describe('buildDeck', () => {
  it('returns an array containing all input words', () => {
    const deck = buildDeck(mockWords)
    expect(deck).toHaveLength(3)
    expect(deck.map((w) => w.id).sort((a, b) => a - b)).toEqual([1, 2, 3])
  })

  it('does not mutate the input array', () => {
    const original = mockWords.map((w) => ({ ...w }))
    buildDeck(mockWords)
    expect(mockWords).toEqual(original)
  })

  it('produces different orderings across multiple calls', () => {
    const orderings = new Set()
    for (let i = 0; i < 30; i++) {
      orderings.add(buildDeck(mockWords).map((w) => w.id).join(','))
    }
    expect(orderings.size).toBeGreaterThan(1)
  })
})

describe('getNextWord', () => {
  it('returns the first word from a non-empty deck', () => {
    const deck = [mockWords[1], mockWords[2], mockWords[0]]
    const { word } = getNextWord(deck, mockWords)
    expect(word).toBe(mockWords[1])
  })

  it('returns the rest of the deck as remainingDeck', () => {
    const deck = [mockWords[1], mockWords[2], mockWords[0]]
    const { remainingDeck } = getNextWord(deck, mockWords)
    expect(remainingDeck).toHaveLength(2)
    expect(remainingDeck).not.toContain(mockWords[1])
  })

  it('reshuffles all words when deck is empty', () => {
    const { word, remainingDeck } = getNextWord([], mockWords)
    expect(mockWords).toContain(word)
    const allIds = [word.id, ...remainingDeck.map((w) => w.id)].sort((a, b) => a - b)
    expect(allIds).toEqual([1, 2, 3])
  })

  it('reshuffled deck has length allWords.length - 1', () => {
    const { remainingDeck } = getNextWord([], mockWords)
    expect(remainingDeck).toHaveLength(2)
  })
})
