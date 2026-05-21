import { useState, useRef, useCallback } from 'react'

const WATCHDOG_MS = 8000

export function useSpeechRecognizer() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const watchdogRef = useRef(null)
  const startRef = useRef(null)

  const start = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.')
      return
    }

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
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current)
        watchdogRef.current = null
      }
      const text = event.results[event.resultIndex][0].transcript
      setTranscript(text)
    }

    recognition.onerror = (event) => {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current)
        watchdogRef.current = null
      }
      if (event.error === 'aborted') return
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current)
        watchdogRef.current = null
      }
      setIsListening(false)
    }

    recognitionRef.current = recognition
    setTranscript('')
    setError(null)
    setIsListening(true)
    recognition.start()

    if (watchdogRef.current) clearTimeout(watchdogRef.current)
    watchdogRef.current = setTimeout(() => {
      watchdogRef.current = null
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (_) {}
      }
      startRef.current?.()
    }, WATCHDOG_MS)
  }, [])

  startRef.current = start

  const stop = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  return { isListening, transcript, error, start, stop }
}
