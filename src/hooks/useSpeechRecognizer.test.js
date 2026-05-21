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
})
