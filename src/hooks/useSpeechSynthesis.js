import { useState, useCallback } from 'react'
import { playAudio } from '../utils/audioPlayer'
import { wordToFilename } from '../utils/audioFilename'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback(async (text) => {
    if (!text?.trim()) return
    setIsSpeaking(true)
    try {
      await playAudio(`/audio/words/${wordToFilename(text)}.mp3`)
    } finally {
      setIsSpeaking(false)
    }
  }, [])

  return { speak, isSpeaking }
}
