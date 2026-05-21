import { fuzzyMatch } from './fuzzyMatch'

describe('fuzzyMatch', () => {
  test('exact match returns true', () => {
    expect(fuzzyMatch('kwadrat', 'kwadrat')).toBe(true)
  })

  test('case-insensitive: uppercase transcript matches lowercase target', () => {
    expect(fuzzyMatch('Kwadrat', 'kwadrat')).toBe(true)
  })

  test('transcript containing extra words still matches', () => {
    expect(fuzzyMatch('to jest kwadrat', 'kwadrat')).toBe(true)
  })

  test('completely different word returns false', () => {
    expect(fuzzyMatch('pies', 'kwadrat')).toBe(false)
  })

  test('empty transcript returns false', () => {
    expect(fuzzyMatch('', 'kwadrat')).toBe(false)
  })

  test('empty target returns false', () => {
    expect(fuzzyMatch('kwadrat', '')).toBe(false)
  })

  test('handles Polish diacritics in target', () => {
    expect(fuzzyMatch('koło', 'koło')).toBe(true)
  })

  test('leading and trailing whitespace is ignored', () => {
    expect(fuzzyMatch('  kwadrat  ', 'kwadrat')).toBe(true)
  })
})
