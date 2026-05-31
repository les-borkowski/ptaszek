import { useState, useCallback } from 'react'
import { playAudio } from '../utils/audioPlayer'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback(async (text) => {
    setIsSpeaking(true)
    await playAudio(`/audio/words/${encodeURIComponent(text)}.mp3`)
    setIsSpeaking(false)
  }, [])

  return { speak, isSpeaking }
}
