import { useState, useRef, useCallback } from 'react'

/**
 * Wraps Web Speech API for speech recognition in Polish (pl-PL).
 *
 * MIGRATION NOTE: To swap in Vosk for offline recognition, replace only
 * this file's internals. The returned interface must stay the same:
 *   { isListening, transcript, error, start, stop }
 *
 * @returns {{ isListening: boolean, transcript: string, error: string|null, start: function, stop: function }}
 */
export function useSpeechRecognizer() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const start = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.')
      return
    }

    // Use Reflect.construct for compatibility with test mocks (vi.fn arrow stubs)
    // that are not constructable but are callable as factories.
    let recognition
    try {
      recognition = new SpeechRecognition()
    } catch {
      recognition = SpeechRecognition()
    }
    recognition.lang = 'pl-PL'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (event) => {
      const text = event.results[event.resultIndex][0].transcript
      setTranscript(text)
    }

    recognition.onerror = (event) => {
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    setTranscript('')
    setError(null)
    setIsListening(true)
    recognition.start()
  }, [])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  return { isListening, transcript, error, start, stop }
}
