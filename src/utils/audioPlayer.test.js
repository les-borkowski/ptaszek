// src/utils/audioPlayer.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { playAudio } from './audioPlayer'

describe('playAudio', () => {
  let mockAudio

  beforeEach(() => {
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      onended: null,
      onerror: null,
    }
    vi.stubGlobal('Audio', vi.fn(function() {
      return mockAudio
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates an Audio element with the given src', () => {
    playAudio('/audio/words/pies.mp3')
    expect(Audio).toHaveBeenCalledWith('/audio/words/pies.mp3')
  })

  it('calls play() on the audio element', () => {
    playAudio('/audio/words/pies.mp3')
    expect(mockAudio.play).toHaveBeenCalled()
  })

  it('returns a Promise', () => {
    const result = playAudio('/audio/words/pies.mp3')
    expect(result).toBeInstanceOf(Promise)
  })

  it('resolves when onended fires', async () => {
    const promise = playAudio('/audio/words/pies.mp3')
    mockAudio.onended()
    await expect(promise).resolves.toBeUndefined()
  })

  it('resolves (not rejects) when onerror fires', async () => {
    const promise = playAudio('/audio/words/pies.mp3')
    mockAudio.onerror()
    await expect(promise).resolves.toBeUndefined()
  })

  it('resolves (not rejects) when play() rejects', async () => {
    mockAudio.play.mockRejectedValue(new Error('NotAllowedError'))
    const promise = playAudio('/audio/words/pies.mp3')
    mockAudio.onerror()
    await expect(promise).resolves.toBeUndefined()
  })
})
