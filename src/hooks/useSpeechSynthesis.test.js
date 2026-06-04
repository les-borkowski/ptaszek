import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useSpeechSynthesis } from './useSpeechSynthesis'
import { playAudio } from '../utils/audioPlayer'
import { wordToFilename } from '../utils/audioFilename'

vi.mock('../utils/audioPlayer', () => ({ playAudio: vi.fn() }))

describe('useSpeechSynthesis', () => {
  let resolveAudio

  beforeEach(() => {
    playAudio.mockReturnValue(new Promise(r => { resolveAudio = r }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('starts with isSpeaking false', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    expect(result.current.isSpeaking).toBe(false)
  })

  it('calls playAudio with the encoded word path', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('pies') })
    expect(playAudio).toHaveBeenCalledWith('/audio/words/pies.mp3')
  })

  it('encodes Polish characters in the word path', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('słoń') })
    expect(playAudio).toHaveBeenCalledWith(`/audio/words/${wordToFilename('słoń')}.mp3`)
  })

  it('sets isSpeaking true immediately when speak is called', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('pies') })
    expect(result.current.isSpeaking).toBe(true)
  })

  it('sets isSpeaking false when audio finishes', async () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('pies') })
    await act(async () => { resolveAudio() })
    expect(result.current.isSpeaking).toBe(false)
  })

  it('does not throw if speak is called with no prior setup', () => {
    playAudio.mockResolvedValue(undefined)
    const { result } = renderHook(() => useSpeechSynthesis())
    expect(() => act(() => { result.current.speak('pies') })).not.toThrow()
  })
})
