import words from './words.json'

describe('words.json', () => {
  test('contains at least 5 entries', () => {
    expect(words.length).toBeGreaterThanOrEqual(5)
  })

  test('every entry has required fields: id, polish, english, image', () => {
    words.forEach((word) => {
      expect(word).toHaveProperty('id')
      expect(word).toHaveProperty('polish')
      expect(word).toHaveProperty('english')
      expect(word).toHaveProperty('image')
    })
  })

  test('all ids are unique', () => {
    const ids = words.map((w) => w.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(words.length)
  })

  test('all polish fields are non-empty strings', () => {
    words.forEach((word) => {
      expect(typeof word.polish).toBe('string')
      expect(word.polish.length).toBeGreaterThan(0)
    })
  })
})
