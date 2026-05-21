import { useState, useEffect } from 'react'
import { GameDisplay } from './components/GameDisplay'
import { useSpeechRecognizer } from './hooks/useSpeechRecognizer'
import { fuzzyMatch } from './utils/fuzzyMatch'
import { playSuccess, playError } from './utils/soundEffects'
import words from './data/words.json'
import './App.css'

/**
 * Returns a random word from the list, avoiding the word just shown.
 * @param {{ id: number }|null} currentWord
 * @returns {{ id: number, polish: string, english: string, image: string }}
 */
function getRandomWord(currentWord) {
  const pool =
    words.length > 1 && currentWord
      ? words.filter((w) => w.id !== currentWord.id)
      : words
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function App() {
  const [currentWord, setCurrentWord] = useState(() => getRandomWord(null))
  const [score, setScore] = useState(0)
  const [status, setStatus] = useState('listening')
  const { transcript, error, start } = useSpeechRecognizer()

  // Start listening when the component first mounts
  useEffect(() => {
    start()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // React to new transcript results
  useEffect(() => {
    if (!transcript || status !== 'listening') return

    if (fuzzyMatch(transcript, currentWord.polish)) {
      setScore((prev) => prev + 1)
      setStatus('correct')
      playSuccess()
      setTimeout(() => {
        setCurrentWord((prev) => getRandomWord(prev))
        setStatus('listening')
        start()
      }, 1500)
    } else {
      setStatus('incorrect')
      playError()
      setTimeout(() => {
        setStatus('listening')
        start()
      }, 1500)
    }
  }, [transcript]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          ⚠️ Mikrofon niedostępny: {error}. Otwórz w Chrome lub Edge i zezwól na mikrofon.
        </div>
      )}
      <GameDisplay word={currentWord} score={score} status={status} />
    </div>
  )
}
