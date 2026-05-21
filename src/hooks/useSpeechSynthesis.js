import { useState, useCallback } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback((text, lang = 'pl-PL') => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    let utterance
    try {
      utterance = new SpeechSynthesisUtterance(text)
    } catch {
      utterance = SpeechSynthesisUtterance(text)
    }
    utterance.lang = lang
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  return { speak, isSpeaking }
}
