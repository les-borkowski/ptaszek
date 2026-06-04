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

  test('"nie" does not match inside "niebieski"', () => {
    expect(fuzzyMatch('niebieski', 'nie')).toBe(false)
  })

  test('"sto" does not match inside "stolik"', () => {
    expect(fuzzyMatch('stolik', 'sto')).toBe(false)
  })

  test('"nie" matches at start of multi-word transcript', () => {
    expect(fuzzyMatch('nie wiem', 'nie')).toBe(true)
  })

  test('"nie" matches as whole word surrounded by words', () => {
    expect(fuzzyMatch('powiedziałem nie głośno', 'nie')).toBe(true)
  })

  test('multi-word target matches in transcript', () => {
    expect(fuzzyMatch('dzień dobry', 'Dzień dobry')).toBe(true)
  })
})
