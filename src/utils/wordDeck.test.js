import { describe, it, expect } from 'vitest'
import { flattenWords, buildDeck, getNextWord } from './wordDeck'

const WORDS = {
  shapes:  [{ word: 'kwadrat', emoji: '🟥' }, { word: 'koło', emoji: '🔵' }],
  colours: [{ word: 'czerwony', emoji: '🔴' }],
}

describe('flattenWords', () => {
  it('returns all words when selectedCategories is null', () => {
    expect(flattenWords(WORDS, null)).toHaveLength(3)
  })
  it('returns all words when selectedCategories is empty array', () => {
    expect(flattenWords(WORDS, [])).toHaveLength(3)
  })
  it('filters to selected categories', () => {
    const result = flattenWords(WORDS, ['shapes'])
    expect(result).toHaveLength(2)
    expect(result.every(w => ['kwadrat','koło'].includes(w.word))).toBe(true)
  })
})

describe('buildDeck', () => {
  it('returns shuffled array with word+emoji', () => {
    const deck = buildDeck(WORDS, null)
    expect(deck).toHaveLength(3)
    expect(deck[0]).toHaveProperty('word')
    expect(deck[0]).toHaveProperty('emoji')
  })
  it('filters to selected categories', () => {
    const deck = buildDeck(WORDS, ['colours'])
    expect(deck).toHaveLength(1)
    expect(deck[0].word).toBe('czerwony')
  })
})

describe('getNextWord', () => {
  it('returns first word from non-empty deck', () => {
    const deck = [{ word: 'koło', emoji: '🔵' }, { word: 'kwadrat', emoji: '🟥' }]
    const { word, remainingDeck } = getNextWord(deck, WORDS, null)
    expect(word.word).toBe('koło')
    expect(remainingDeck).toHaveLength(1)
  })
  it('reshuffles when deck is empty', () => {
    const { word, remainingDeck } = getNextWord([], WORDS, null)
    expect(word).toHaveProperty('word')
    expect(remainingDeck).toHaveLength(2)
  })
})
