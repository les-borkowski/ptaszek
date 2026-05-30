import words from './words.json'

describe('words.json', () => {
  test('has category keys', () => {
    expect(words).toHaveProperty('shapes')
    expect(words).toHaveProperty('colours')
    expect(words).toHaveProperty('domestic_animals')
  })

  test('each category has at least 5 entries', () => {
    Object.values(words).forEach(entries => {
      expect(entries.length).toBeGreaterThanOrEqual(5)
    })
  })

  test('every entry has required fields: word, emoji', () => {
    Object.values(words).forEach(entries => {
      entries.forEach(entry => {
        expect(entry).toHaveProperty('word')
        expect(entry).toHaveProperty('emoji')
      })
    })
  })

  test('all word fields are non-empty strings', () => {
    Object.values(words).forEach(entries => {
      entries.forEach(entry => {
        expect(typeof entry.word).toBe('string')
        expect(entry.word.length).toBeGreaterThan(0)
      })
    })
  })
})
