import words from './words.json'
import categories from './categories.json'

describe('words.json', () => {
  test('has all category keys from categories.json', () => {
    categories.forEach(cat => {
      expect(words).toHaveProperty(cat.id)
    })
  })

  test('each category has at least 5 entries', () => {
    Object.values(words).forEach(entries => {
      expect(entries.length).toBeGreaterThanOrEqual(5)
    })
  })

  test('every entry has required fields: word, emoji, translation', () => {
    Object.values(words).forEach(entries => {
      entries.forEach(entry => {
        expect(entry).toHaveProperty('word')
        expect(entry).toHaveProperty('emoji')
        expect(entry).toHaveProperty('translation')
      })
    })
  })

  test('all word and translation fields are non-empty strings', () => {
    Object.values(words).forEach(entries => {
      entries.forEach(entry => {
        expect(typeof entry.word).toBe('string')
        expect(entry.word.length).toBeGreaterThan(0)
        expect(typeof entry.translation).toBe('string')
        expect(entry.translation.length).toBeGreaterThan(0)
      })
    })
  })

  test('no unexpected duplicate words across categories (known exceptions: ryba, serce)', () => {
    const KNOWN_DUPLICATES = ['ryba', 'serce']
    const allWords = Object.values(words).flat().map(e => e.word)
    const seen = new Set()
    const unexpectedDuplicates = []
    allWords.forEach(w => {
      if (seen.has(w) && !KNOWN_DUPLICATES.includes(w)) unexpectedDuplicates.push(w)
      seen.add(w)
    })
    expect(unexpectedDuplicates).toEqual([])
  })
})
