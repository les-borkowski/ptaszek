import { renderHook, act } from '@testing-library/react'
import { useSpeechRecognizer } from './useSpeechRecognizer'

describe('useSpeechRecognizer', () => {
  let mockRecognition

  beforeEach(() => {
    mockRecognition = {
      lang: '',
      interimResults: false,
      continuous: false,
      onresult: null,
      onerror: null,
      onend: null,
      start: vi.fn(),
      stop: vi.fn(),
    }
    const MockSpeechRecognition = vi.fn(() => mockRecognition)
    vi.stubGlobal('SpeechRecognition', MockSpeechRecognition)
    vi.stubGlobal('webkitSpeechRecognition', MockSpeechRecognition)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('initializes with isListening=false, transcript="", error=null', () => {
    const { result } = renderHook(() => useSpeechRecognizer())
    expect(result.current.isListening).toBe(false)
    expect(result.current.transcript).toBe('')
    expect(result.current.error).toBeNull()
  })

  test('start() sets isListening=true and calls recognition.start', () => {
    const { result } = renderHook(() => useSpeechRecognizer())
    act(() => {
      result.current.start()
    })
    expect(result.current.isListening).toBe(true)
    expect(mockRecognition.start).toHaveBeenCalledTimes(1)
  })

  test('start() configures recognition with pl-PL language', () => {
    const { result } = renderHook(() => useSpeechRecognizer())
    act(() => {
      result.current.start()
    })
    expect(mockRecognition.lang).toBe('pl-PL')
  })

  test('stop() sets isListening=false and calls recognition.stop', () => {
    const { result } = renderHook(() => useSpeechRecognizer())
    act(() => { result.current.start() })
    act(() => { result.current.stop() })
    expect(result.current.isListening).toBe(false)
    expect(mockRecognition.stop).toHaveBeenCalledTimes(1)
  })

  test('onresult event updates transcript', () => {
    const { result } = renderHook(() => useSpeechRecognizer())
    act(() => { result.current.start() })
    act(() => {
      mockRecognition.onresult({
        results: [[{ transcript: 'kwadrat' }]],
        resultIndex: 0,
      })
    })
    expect(result.current.transcript).toBe('kwadrat')
  })

  test('onerror event sets error and stops listening', () => {
    const { result } = renderHook(() => useSpeechRecognizer())
    act(() => { result.current.start() })
    act(() => {
      mockRecognition.onerror({ error: 'not-allowed' })
    })
    expect(result.current.error).toBe('not-allowed')
    expect(result.current.isListening).toBe(false)
  })

  test('onend event sets isListening=false', () => {
    const { result } = renderHook(() => useSpeechRecognizer())
    act(() => { result.current.start() })
    act(() => {
      mockRecognition.onend()
    })
    expect(result.current.isListening).toBe(false)
  })

  test('start() resets transcript to empty string', () => {
    const { result } = renderHook(() => useSpeechRecognizer())
    act(() => { result.current.start() })
    act(() => {
      mockRecognition.onresult({
        results: [[{ transcript: 'kwadrat' }]],
        resultIndex: 0,
      })
    })
    expect(result.current.transcript).toBe('kwadrat')

    act(() => { result.current.start() })
    expect(result.current.transcript).toBe('')
  })

  describe('watchdog', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    test('restarts recognition after 8 s with no result', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      expect(mockRecognition.start).toHaveBeenCalledTimes(1)

      act(() => { vi.advanceTimersByTime(8000) })

      expect(mockRecognition.stop).toHaveBeenCalledTimes(1)
      expect(mockRecognition.start).toHaveBeenCalledTimes(2)
    })

    test('watchdog is cancelled when onresult fires', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      act(() => {
        mockRecognition.onresult({ results: [[{ transcript: 'pies' }]], resultIndex: 0 })
      })
      act(() => { vi.advanceTimersByTime(8000) })
      expect(mockRecognition.start).toHaveBeenCalledTimes(1)
    })

    test('watchdog is cancelled when onend fires', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      act(() => { mockRecognition.onend() })
      act(() => { vi.advanceTimersByTime(8000) })
      expect(mockRecognition.start).toHaveBeenCalledTimes(1)
    })

    test('watchdog is cancelled when stop() is called', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      act(() => { result.current.stop() })
      act(() => { vi.advanceTimersByTime(8000) })
      expect(mockRecognition.start).toHaveBeenCalledTimes(1)
    })
  })

  test('calling start() while already listening stops the previous session', () => {
    const { result } = renderHook(() => useSpeechRecognizer())
    act(() => { result.current.start() })
    expect(mockRecognition.start).toHaveBeenCalledTimes(1)
    expect(mockRecognition.stop).toHaveBeenCalledTimes(0)
    // Second start() without stopping first — must stop previous session
    act(() => { result.current.start() })
    expect(mockRecognition.stop).toHaveBeenCalledTimes(1)
    expect(mockRecognition.start).toHaveBeenCalledTimes(2)
  })

  test('unmounting while listening stops recognition and cancels watchdog', () => {
    vi.useFakeTimers()
    const { result, unmount } = renderHook(() => useSpeechRecognizer())
    act(() => { result.current.start() })
    unmount()
    expect(mockRecognition.stop).toHaveBeenCalledTimes(1)
    // Watchdog must not restart recognition after unmount
    act(() => { vi.advanceTimersByTime(8000) })
    expect(mockRecognition.start).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  describe('aborted error', () => {
    test('aborted onerror does not set error state', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      act(() => { mockRecognition.onerror({ error: 'aborted' }) })
      expect(result.current.error).toBeNull()
    })

    test('non-aborted onerror still sets error state', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      act(() => { mockRecognition.onerror({ error: 'not-allowed' }) })
      expect(result.current.error).toBe('not-allowed')
    })
  })
})
