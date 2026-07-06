import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, test, expect, beforeEach } from 'vitest'

vi.mock('./hooks/useSpeechRecognizer', () => ({
  useSpeechRecognizer: vi.fn(() => ({
    isListening: false, transcript: '', error: null,
    start: vi.fn(), stop: vi.fn(),
  })),
}))

vi.mock('./utils/soundEffects', () => ({
  playSuccess: vi.fn(),
  playError: vi.fn(),
}))

vi.mock('./hooks/useSpeechSynthesis', () => ({
  useSpeechSynthesis: vi.fn(() => ({
    speak: vi.fn(), isSpeaking: false,
  })),
}))

// jsdom's HTMLMediaElement.play() doesn't return a Promise, which breaks the
// real speakPraise()'s `.catch()` call. Stub it out for these App-level tests
// since praise audio playback isn't what's under test here.
vi.mock('./components/Paper', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, speakPraise: vi.fn() }
})

import App from './App'
import { useSpeechRecognizer } from './hooks/useSpeechRecognizer'
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis'

describe('App (cut-paper)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useSpeechRecognizer.mockReturnValue({
      isListening: false, transcript: '', error: null,
      start: vi.fn(), stop: vi.fn(),
    })
    useSpeechSynthesis.mockReturnValue({ speak: vi.fn(), isSpeaking: false })
  })

  test('renders the cut-paper game shell', () => {
    const { container } = render(<App />)
    expect(container.querySelector('.game-shell')).toBeInTheDocument()
    expect(container.querySelector('.game-kraft')).toBeInTheDocument()
  })

  test('renders the title screen on first render', () => {
    render(<App />)
    expect(screen.getByText('Słowik')).toBeInTheDocument()
  })

  test('shows the listening prompt bubble on first render', () => {
    render(<App />)
    expect(screen.getByText(/Powiedz słowo/i)).toBeInTheDocument()
  })

  test('does not call start() on title screen (game not yet started)', () => {
    const mockStart = vi.fn()
    useSpeechRecognizer.mockReturnValue({
      isListening: false, transcript: '', error: null,
      start: mockStart, stop: vi.fn(),
    })
    render(<App />)
    expect(mockStart).not.toHaveBeenCalled()
  })

  test('does not call speak() on title screen even when learnMode is true', () => {
    localStorage.setItem('learnMode', 'true')
    const mockSpeak = vi.fn()
    const mockStart = vi.fn()
    useSpeechSynthesis.mockReturnValue({ speak: mockSpeak, isSpeaking: false })
    useSpeechRecognizer.mockReturnValue({
      isListening: false, transcript: '', error: null,
      start: mockStart, stop: vi.fn(),
    })
    render(<App />)
    expect(mockSpeak).not.toHaveBeenCalled()
    expect(mockStart).not.toHaveBeenCalled()
  })

  test('renders mode toggle on title screen', () => {
    render(<App />)
    expect(screen.getByText(/Powiedz słowo/i)).toBeInTheDocument()
  })

  test('renders the play button on title screen', () => {
    render(<App />)
    expect(screen.getByText(/Graj/i)).toBeInTheDocument()
  })
})

describe('Translation toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    useSpeechRecognizer.mockReturnValue({
      isListening: false, transcript: '', error: null,
      start: vi.fn(), stop: vi.fn(),
    })
    useSpeechSynthesis.mockReturnValue({ speak: vi.fn(), isSpeaking: false })
  })

  test('persists the translation toggle to localStorage under słowik_show_translation', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: /Graj/i }))

    expect(localStorage.getItem('słowik_show_translation')).toBeNull()

    await userEvent.click(screen.getByRole('checkbox', { name: /tłumaczenie/i }))
    expect(localStorage.getItem('słowik_show_translation')).toBe('true')
  })

  test('restores the translation toggle from localStorage on mount', () => {
    localStorage.setItem('słowik_show_translation', 'true')
    render(<App />)
    expect(screen.getByText(/Graj/i)).toBeInTheDocument()
  })
})

describe('Skip button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  function enterSayModeGame(recognizerOverrides = {}) {
    useSpeechRecognizer.mockReturnValue({
      isListening: false, transcript: '', error: null,
      start: vi.fn(), stop: vi.fn(), ...recognizerOverrides,
    })
    useSpeechSynthesis.mockReturnValue({ speak: vi.fn(), isSpeaking: false })
    return render(<App />)
  }

  test('clicking Skip in say mode advances to a different word with no score change', async () => {
    const { container } = enterSayModeGame()
    await userEvent.click(screen.getByRole('button', { name: /Graj/i }))
    const firstWordAlt = container.querySelector('.word-area img').alt

    await userEvent.click(screen.getByRole('button', { name: /Pomiń słowo/i }))

    const secondWordAlt = container.querySelector('.word-area img').alt
    expect(secondWordAlt).not.toBe(firstWordAlt)
    expect(screen.getByText(/POSTĘP/i)).toBeInTheDocument()
    expect(screen.queryByText(/Brawo!/i)).not.toBeInTheDocument()
  })

  test('clicking Skip stops the recognizer when it is listening', async () => {
    const mockStop = vi.fn()
    enterSayModeGame({ isListening: true, stop: mockStop })
    await userEvent.click(screen.getByRole('button', { name: /Graj/i }))

    await userEvent.click(screen.getByRole('button', { name: /Pomiń słowo/i }))

    expect(mockStop).toHaveBeenCalled()
  })

  test('Skip during the correct-answer celebration delay advances the deck exactly once', async () => {
    vi.useFakeTimers()
    useSpeechRecognizer.mockReturnValue({
      isListening: true, transcript: '', error: null, start: vi.fn(), stop: vi.fn(),
    })
    useSpeechSynthesis.mockReturnValue({ speak: vi.fn(), isSpeaking: false })
    const { rerender, container } = render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Graj/i }))
    const firstWordAlt = container.querySelector('.word-area img').alt

    // Simulate a correct transcript match — this schedules the ~1.6-2.4s advance timeout
    useSpeechRecognizer.mockReturnValue({
      isListening: true, transcript: firstWordAlt, error: null, start: vi.fn(), stop: vi.fn(),
    })
    rerender(<App />)
    // Celebration kind is chosen randomly and some kinds (e.g. balloons/confetti)
    // render an extra "Brawo!" node alongside the status feedback bubble, so use
    // getAllByText to stay robust to which kind fires.
    expect(screen.getAllByText(/Brawo!/i).length).toBeGreaterThan(0)

    // Mid-celebration, hit Skip — should cancel the pending timeout and advance immediately
    fireEvent.click(screen.getByRole('button', { name: /Pomiń słowo/i }))
    const afterSkipAlt = container.querySelector('.word-area img').alt
    expect(afterSkipAlt).not.toBe(firstWordAlt)

    // Advance timers past when the original celebration timeout would have fired
    vi.advanceTimersByTime(3000)
    const finalAlt = container.querySelector('.word-area img').alt

    // If the stale timeout had fired, this would have changed a second time
    expect(finalAlt).toBe(afterSkipAlt)

    vi.useRealTimers()
  })
})

describe('Game loop edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('hear mode: tapping the correct card advances after the celebration delay', () => {
    vi.useFakeTimers()
    const mockSpeak = vi.fn()
    useSpeechRecognizer.mockReturnValue({
      isListening: false, transcript: '', error: null, start: vi.fn(), stop: vi.fn(),
    })
    useSpeechSynthesis.mockReturnValue({ speak: mockSpeak, isSpeaking: false })
    render(<App />)

    fireEvent.click(screen.getByText(/Usłysz i dotknij/i))
    fireEvent.click(screen.getByRole('button', { name: /Graj/i }))

    const firstSpoken = mockSpeak.mock.calls.at(-1)[0]
    fireEvent.click(screen.getByRole('button', { name: firstSpoken }))

    expect(screen.getAllByText(/Brawo!/i).length).toBeGreaterThan(0)

    act(() => { vi.advanceTimersByTime(3000) })

    // Celebration state (set directly inside the scheduled timeout callback,
    // not behind an effect) has cleared and the screen is back to listening.
    expect(screen.queryByText(/Brawo!/i)).not.toBeInTheDocument()
    expect(screen.getByText(/Usłysz i dotknij/i)).toBeInTheDocument()

    vi.useRealTimers()
  })

  test('back-to-title mid-celebration cancels the pending timeout (no stray advance)', () => {
    vi.useFakeTimers()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    useSpeechRecognizer.mockReturnValue({
      isListening: true, transcript: '', error: null, start: vi.fn(), stop: vi.fn(),
    })
    useSpeechSynthesis.mockReturnValue({ speak: vi.fn(), isSpeaking: false })
    const { rerender, container } = render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Graj/i }))
    const firstWordAlt = container.querySelector('.word-area img').alt

    useSpeechRecognizer.mockReturnValue({
      isListening: true, transcript: firstWordAlt, error: null, start: vi.fn(), stop: vi.fn(),
    })
    rerender(<App />)
    expect(screen.getAllByText(/Brawo!/i).length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Wróć do menu/i }))
    expect(screen.getByText('Słowik')).toBeInTheDocument()

    // Previously, this stray timeout would fire while on the title screen
    // and silently advance the (now-hidden) deck. Confirm it's a no-op.
    vi.advanceTimersByTime(3000)
    expect(screen.getByText('Słowik')).toBeInTheDocument()
    expect(consoleError).not.toHaveBeenCalled()

    consoleError.mockRestore()
    vi.useRealTimers()
  })

  test('incorrect transcript shows the retry bubble and restarts listening after 1.5s', () => {
    vi.useFakeTimers()
    const mockStart = vi.fn()
    useSpeechRecognizer.mockReturnValue({
      isListening: true, transcript: '', error: null, start: mockStart, stop: vi.fn(),
    })
    useSpeechSynthesis.mockReturnValue({ speak: vi.fn(), isSpeaking: false })
    const { rerender } = render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Graj/i }))
    mockStart.mockClear()

    useSpeechRecognizer.mockReturnValue({
      isListening: true, transcript: 'zupełnie inne słowo', error: null, start: mockStart, stop: vi.fn(),
    })
    rerender(<App />)

    expect(screen.getByText(/Spróbuj jeszcze raz/i)).toBeInTheDocument()
    expect(mockStart).not.toHaveBeenCalled()

    act(() => { vi.advanceTimersByTime(1500) })
    expect(mockStart).toHaveBeenCalled()

    vi.useRealTimers()
  })
})
