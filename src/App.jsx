import { useState, useEffect, useRef } from 'react'
import { GameDisplay } from './components/GameDisplay'
import { useSpeechRecognizer } from './hooks/useSpeechRecognizer'
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis'
import { fuzzyMatch } from './utils/fuzzyMatch'
import { playSuccess, playError } from './utils/soundEffects'
import { buildDeck, getNextWord } from './utils/wordDeck'
import words from './data/words.json'
import './App.css'

export default function App() {
  const [wordState, setWordState] = useState(() => {
    const shuffled = buildDeck(words)
    return { currentWord: shuffled[0], deck: shuffled.slice(1) }
  })
  const { currentWord, deck } = wordState

  const [score, setScore] = useState(0)
  const [status, setStatus] = useState('listening')
  const [learnMode, setLearnMode] = useState(
    () => localStorage.getItem('learnMode') === 'true'
  )

  const { transcript, error, start, stop, isListening } = useSpeechRecognizer()
  const { speak, isSpeaking } = useSpeechSynthesis()
  const prevIsSpeakingRef = useRef(false)

  // On each new word: speak (learn mode) or listen directly
  useEffect(() => {
    if (learnMode) {
      speak(currentWord.polish)
    } else {
      start()
    }
  }, [currentWord]) // eslint-disable-line react-hooks/exhaustive-deps

  // After TTS finishes (isSpeaking false→true→false), start listening
  useEffect(() => {
    if (prevIsSpeakingRef.current && !isSpeaking) {
      start()
    }
    prevIsSpeakingRef.current = isSpeaking
  }, [isSpeaking]) // eslint-disable-line react-hooks/exhaustive-deps

  // React to speech recognition results
  useEffect(() => {
    if (!transcript || status !== 'listening') return

    if (fuzzyMatch(transcript, currentWord.polish)) {
      setScore((prev) => prev + 1)
      setStatus('correct')
      playSuccess()
      setTimeout(() => {
        setWordState(({ deck: d }) => {
          const { word, remainingDeck } = getNextWord(d, words)
          return { currentWord: word, deck: remainingDeck }
        })
        setStatus('listening')
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

  const handleLearnModeChange = (value) => {
    setLearnMode(value)
    localStorage.setItem('learnMode', String(value))
  }

  const handleSpeak = () => {
    if (isListening) stop()
    speak(currentWord.polish)
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          ⚠️ Mikrofon niedostępny: {error}. Otwórz w Chrome lub Edge i zezwól na mikrofon.
        </div>
      )}
      <GameDisplay
        word={currentWord}
        score={score}
        status={status}
        learnMode={learnMode}
        onLearnModeChange={handleLearnModeChange}
        onSpeak={handleSpeak}
      />
    </div>
  )
}
