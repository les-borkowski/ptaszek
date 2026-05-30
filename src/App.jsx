import { useState, useEffect, useRef } from 'react'
import { GameDisplay } from './components/GameDisplay'
import { useSpeechRecognizer } from './hooks/useSpeechRecognizer'
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis'
import { fuzzyMatch } from './utils/fuzzyMatch'
import { playSuccess, playError } from './utils/soundEffects'
import { buildDeck, getNextWord } from './utils/wordDeck'
import { speakPraise } from './components/Paper'
import { CELEBRATION_KINDS } from './components/Celebrations'
import words from './data/words.json'
import './App.css'

const PRAISE_PHRASES = ['Brawo!', 'Super!', 'Świetnie!', 'Tak jest!', 'Wspaniale!', 'Pięknie!']

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

export default function App() {
  const [wordState, setWordState] = useState(() => {
    const shuffled = buildDeck(words, null)
    return { currentWord: shuffled[0], deck: shuffled.slice(1) }
  })
  const { currentWord, deck } = wordState

  const [score, setScore] = useState(0)
  const [status, setStatus] = useState('listening')
  const [celebration, setCelebration] = useState(null)
  const [learnMode, setLearnMode] = useState(
    () => localStorage.getItem('learnMode') === 'true'
  )

  const { transcript, error, start, stop, isListening } = useSpeechRecognizer()
  const { speak, isSpeaking } = useSpeechSynthesis()
  const prevIsSpeakingRef = useRef(false)

  // On each new word: speak (learn mode) or listen directly
  useEffect(() => {
    if (learnMode) {
      speak(currentWord.word)
    } else {
      start()
    }
  }, [currentWord]) // eslint-disable-line react-hooks/exhaustive-deps

  // After TTS finishes (true→false), start listening
  useEffect(() => {
    if (prevIsSpeakingRef.current && !isSpeaking) {
      start()
    }
    prevIsSpeakingRef.current = isSpeaking
  }, [isSpeaking]) // eslint-disable-line react-hooks/exhaustive-deps

  // React to speech recognition results
  useEffect(() => {
    if (!transcript || status !== 'listening') return

    if (fuzzyMatch(transcript, currentWord.word)) {
      const newScore = score + 1
      const isMilestone = newScore % 5 === 0
      const cel = isMilestone ? 'fireworks' : pickRandom(CELEBRATION_KINDS)
      const phrase = isMilestone ? 'Wspaniale!' : pickRandom(PRAISE_PHRASES)
      setScore(newScore)
      setStatus('correct')
      setCelebration({ kind: cel, key: Date.now() })
      playSuccess()
      speakPraise(phrase)
      const delay = isMilestone ? 2400 : 1600
      setTimeout(() => {
        setCelebration(null)
        setWordState(({ deck: d }) => {
          const { word, remainingDeck } = getNextWord(d, words, null)
          return { currentWord: word, deck: remainingDeck }
        })
        setStatus('listening')
      }, delay)
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
    speak(currentWord.word)
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
        celebration={celebration}
        learnMode={learnMode}
        onLearnModeChange={handleLearnModeChange}
        onSpeak={handleSpeak}
      />
    </div>
  )
}
