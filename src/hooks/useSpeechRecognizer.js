import { useState, useRef, useCallback, useEffect } from 'react'

const WATCHDOG_MS = 8000

export function useSpeechRecognizer() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const watchdogRef = useRef(null)
  const startRef = useRef(null)

  const stopExisting = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch { /* already stopped */ }
      recognitionRef.current = null
    }
  }, [])

  const start = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.')
      return
    }

    // Stop any existing session before starting a new one
    stopExisting()

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

    watchdogRef.current = setTimeout(() => {
      watchdogRef.current = null
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch { /* already stopped */ }
        recognitionRef.current = null
      }
      startRef.current?.()
    }, WATCHDOG_MS)
  }, [stopExisting])

  useEffect(() => { startRef.current = start }, [start])

  const stop = useCallback(() => {
    stopExisting()
    setIsListening(false)
  }, [stopExisting])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current)
        watchdogRef.current = null
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch { /* already stopped */ }
        recognitionRef.current = null
      }
    }
  }, [])

  return { isListening, transcript, error, start, stop }
}
