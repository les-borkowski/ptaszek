import { render, screen } from '@testing-library/react'
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
    expect(screen.getByText('Ptaszek')).toBeInTheDocument()
  })

  test('shows the listening prompt bubble on first render', () => {
    render(<App />)
    expect(screen.getByText(/Powiedz słowo/i)).toBeInTheDocument()
  })

  test('calls start() on mount (learnMode off)', () => {
    const mockStart = vi.fn()
    useSpeechRecognizer.mockReturnValue({
      isListening: false, transcript: '', error: null,
      start: mockStart, stop: vi.fn(),
    })
    render(<App />)
    expect(mockStart).toHaveBeenCalledTimes(1)
  })

  test('calls speak() on mount when learnMode is true', () => {
    localStorage.setItem('learnMode', 'true')
    const mockSpeak = vi.fn()
    const mockStart = vi.fn()
    useSpeechSynthesis.mockReturnValue({ speak: mockSpeak, isSpeaking: false })
    useSpeechRecognizer.mockReturnValue({
      isListening: false, transcript: '', error: null,
      start: mockStart, stop: vi.fn(),
    })
    render(<App />)
    expect(mockSpeak).toHaveBeenCalledTimes(1)
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
