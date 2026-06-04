import { useState, useCallback } from 'react'
import { playAudio } from '../utils/audioPlayer'
import { wordToFilename } from '../utils/audioFilename'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback(async (text) => {
    setIsSpeaking(true)
    await playAudio(`/audio/words/${wordToFilename(text)}.mp3`)
    setIsSpeaking(false)
  }, [])

  return { speak, isSpeaking }
}
