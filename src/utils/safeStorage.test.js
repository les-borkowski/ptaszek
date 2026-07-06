// src/utils/safeStorage.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getString, setString, getJSON, setJSON } from './safeStorage'

describe('safeStorage', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { vi.unstubAllGlobals() })

  describe('getString / setString', () => {
    it('round-trips a string value', () => {
      setString('key', 'wartość')
      expect(getString('key')).toBe('wartość')
    })

    it('returns the fallback when the key is missing', () => {
      expect(getString('missing', 'domyślna')).toBe('domyślna')
    })

    it('returns null by default when the key is missing', () => {
      expect(getString('missing')).toBeNull()
    })

    it('does not throw when storage throws', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => { throw new Error('SecurityError') },
        setItem: () => { throw new Error('QuotaExceededError') },
      })
      expect(() => setString('key', 'v')).not.toThrow()
      expect(getString('key', 'fallback')).toBe('fallback')
    })
  })

  describe('getJSON / setJSON', () => {
    it('round-trips objects and arrays', () => {
      setJSON('obj', { a: 1 })
      setJSON('arr', ['x', 'y'])
      expect(getJSON('obj')).toEqual({ a: 1 })
      expect(getJSON('arr')).toEqual(['x', 'y'])
    })

    it('returns the fallback when the key is missing', () => {
      expect(getJSON('missing', [])).toEqual([])
    })

    it('returns null by default when the key is missing', () => {
      expect(getJSON('missing')).toBeNull()
    })

    it('returns the fallback on corrupt JSON', () => {
      localStorage.setItem('corrupt', '{not json')
      expect(getJSON('corrupt', [])).toEqual([])
    })

    it('does not throw when storage throws', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => { throw new Error('SecurityError') },
        setItem: () => { throw new Error('QuotaExceededError') },
      })
      expect(() => setJSON('key', { a: 1 })).not.toThrow()
      expect(getJSON('key', 'fallback')).toBe('fallback')
    })
  })
})
