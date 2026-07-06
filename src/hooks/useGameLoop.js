import { useState, useEffect, useRef, useEffectEvent } from 'react'
import { useSpeechRecognizer } from './useSpeechRecognizer'
import { useSpeechSynthesis } from './useSpeechSynthesis'
import { fuzzyMatch } from '../utils/fuzzyMatch'
import { playSuccess, playError } from '../utils/soundEffects'
import { buildDeck, getNextWord, flattenWords } from '../utils/wordDeck'
import { speakPraise } from '../components/Paper'
import { CELEBRATION_KINDS } from '../components/Celebrations'

const PRAISE_PHRASES = ['Brawo!', 'Super!', 'Świetnie!', 'Tak jest!', 'Wspaniale!', 'Pięknie!']

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function pickDistractors(word, allWords, selectedCategories, count = 3) {
  const pool = flattenWords(allWords, selectedCategories).filter(w => w.word !== word.word)
  // If selected categories don't have enough distractors, pull from all categories
  const fallback = pool.length < count
    ? flattenWords(allWords, null).filter(w => w.word !== word.word)
    : pool
  return shuffleArray(fallback).slice(0, count)
}

function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Owns the play-screen game state: current word/deck, score, status,
// celebrations, hear-mode options, speech recognition/synthesis, and the
// correct/incorrect/skip/reset handlers. `words`/`selectedCategories`/`mode`/
// `screen`/`learnMode` are read each render from the caller (App owns them).
export function useGameLoop({ words, selectedCategories, mode, screen, learnMode }) {
  const [wordState, setWordState] = useState(() => {
    const shuffled = buildDeck(words, null)
    return { currentWord: shuffled[0], deck: shuffled.slice(1) }
  })
  const { currentWord } = wordState

  const [score, setScore] = useState(0)
  const [status, setStatus] = useState('listening')
  const [celebration, setCelebration] = useState(null)
  const [hearOptions, setHearOptions] = useState([])

  const { transcript, error, start, stop, isListening } = useSpeechRecognizer()
  const { speak, isSpeaking } = useSpeechSynthesis()
  const prevIsSpeakingRef = useRef(false)
  const lastProcessedTranscript = useRef('')
  const pendingTimeoutRef = useRef(null)

  function cancelPending() {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current)
      pendingTimeoutRef.current = null
    }
  }
  function schedule(fn, delay) {
    cancelPending()
    pendingTimeoutRef.current = setTimeout(() => {
      pendingTimeoutRef.current = null
      fn()
    }, delay)
  }

  // Cancel any pending advance/retry timer on unmount
  useEffect(() => cancelPending, [])

  function handleCorrect() {
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
    schedule(() => {
      setCelebration(null)
      setWordState(({ deck: d }) => {
        const { word, remainingDeck } = getNextWord(d, words, selectedCategories)
        return { currentWord: word, deck: remainingDeck }
      })
      setStatus('listening')
    }, delay)
  }

  function handleIncorrect({ restartListening }) {
    setStatus('incorrect')
    playError()
    schedule(() => {
      setStatus('listening')
      if (restartListening) start()
    }, 1500)
  }

  // On each new word while game is active: speak (learn mode) or listen directly
  const onNewWord = useEffectEvent(() => {
    if (screen !== 'game' || mode === 'hear') return
    lastProcessedTranscript.current = ''
    if (learnMode) {
      speak(currentWord.word)
    } else {
      start()
    }
  })
  useEffect(() => {
    onNewWord()
  }, [currentWord, screen])

  // After TTS finishes (true→false), start listening — but not in hear mode
  const onSpeakingChange = useEffectEvent(() => {
    if (prevIsSpeakingRef.current && !isSpeaking && mode !== 'hear') {
      start()
    }
    prevIsSpeakingRef.current = isSpeaking
  })
  useEffect(() => {
    onSpeakingChange()
  }, [isSpeaking])

  // React to speech recognition results
  const onTranscript = useEffectEvent(() => {
    if (!transcript || status !== 'listening') return
    if (transcript === lastProcessedTranscript.current) return
    lastProcessedTranscript.current = transcript

    if (fuzzyMatch(transcript, currentWord.word)) {
      handleCorrect()
    } else {
      handleIncorrect({ restartListening: true })
    }
  })
  useEffect(() => {
    // The setState calls happen inside the useEffectEvent callback above (a
    // non-reactive handler for the external transcript event), which is the
    // pattern react-hooks/set-state-in-effect itself recommends — but the
    // rule's static analysis still flags the call site.
    onTranscript() // eslint-disable-line react-hooks/set-state-in-effect
  }, [transcript])

  // Set up hear-mode options (correct word + distractors) and speak the word
  const onHearWordSetup = useEffectEvent(() => {
    if (mode !== 'hear' || screen !== 'game') return
    const distractors = pickDistractors(currentWord, words, selectedCategories)
    setHearOptions(shuffleArray([currentWord, ...distractors]))
    speak(currentWord.word)
  })
  useEffect(() => {
    // See the transcript effect above for why this disable is a false positive.
    onHearWordSetup() // eslint-disable-line react-hooks/set-state-in-effect
  }, [currentWord, mode, screen])

  function handleSpeak() {
    if (isListening) stop()
    speak(currentWord.word)
  }

  function handleHearSelect(option) {
    if (status !== 'listening') return
    if (option.word === currentWord.word) {
      handleCorrect()
    } else {
      handleIncorrect({ restartListening: false })
    }
  }

  function handleSkip() {
    cancelPending()
    if (isListening) stop()
    setCelebration(null)
    setStatus('listening')
    setWordState(({ deck: d }) => {
      const { word, remainingDeck } = getNextWord(d, words, selectedCategories)
      return { currentWord: word, deck: remainingDeck }
    })
  }

  // Builds a fresh deck and zeroes score/status/celebration. Returns false
  // (without changing anything) if the selected categories yield no words.
  function resetGame() {
    const newDeck = buildDeck(words, selectedCategories)
    if (newDeck.length === 0) return false
    cancelPending()
    setWordState({ currentWord: newDeck[0], deck: newDeck.slice(1) })
    setScore(0)
    setStatus('listening')
    setCelebration(null)
    return true
  }

  return {
    currentWord,
    score,
    status,
    celebration,
    hearOptions,
    error,
    isListening,
    handleSpeak,
    handleSkip,
    handleHearSelect,
    resetGame,
  }
}
