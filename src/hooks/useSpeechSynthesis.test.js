import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSpeechSynthesis } from './useSpeechSynthesis'

describe('useSpeechSynthesis', () => {
  let mockUtterance
  let mockSynth

  beforeEach(() => {
    mockUtterance = { lang: '', onstart: null, onend: null, onerror: null }
    vi.stubGlobal('SpeechSynthesisUtterance', vi.fn(function() { return mockUtterance }))
    mockSynth = { cancel: vi.fn(), speak: vi.fn(), resume: vi.fn() }
    vi.stubGlobal('speechSynthesis', mockSynth)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts with isSpeaking false', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    expect(result.current.isSpeaking).toBe(false)
  })

  it('cancels existing speech and speaks the utterance', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('pies') })
    expect(mockSynth.cancel).toHaveBeenCalled()
    expect(mockSynth.speak).toHaveBeenCalledWith(mockUtterance)
    expect(mockUtterance.lang).toBe('pl-PL')
  })

  it('accepts a custom lang', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('dog', 'en-US') })
    expect(mockUtterance.lang).toBe('en-US')
  })

  it('sets isSpeaking true on utterance onstart', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('pies') })
    act(() => { mockUtterance.onstart() })
    expect(result.current.isSpeaking).toBe(true)
  })

  it('sets isSpeaking false on utterance onend', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('pies') })
    act(() => { mockUtterance.onstart() })
    act(() => { mockUtterance.onend() })
    expect(result.current.isSpeaking).toBe(false)
  })

  it('sets isSpeaking false on utterance onerror', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('pies') })
    act(() => { mockUtterance.onstart() })
    act(() => { mockUtterance.onerror() })
    expect(result.current.isSpeaking).toBe(false)
  })

  it('does nothing if speechSynthesis is unavailable', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useSpeechSynthesis())
    expect(() => act(() => { result.current.speak('pies') })).not.toThrow()
  })
})
