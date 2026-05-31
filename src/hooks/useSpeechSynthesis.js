import { useState, useCallback, useRef } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef(null)

  const speak = useCallback((text, lang = 'pl-PL') => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.resume()   // unpause Chrome if suspended
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    utteranceRef.current = utterance  // prevent Chrome GC from dropping before events fire
    window.speechSynthesis.speak(utterance)
  }, [])

  return { speak, isSpeaking }
}
