import { useState, useEffect, useRef } from 'react'
import { GameDisplay } from './components/GameDisplay'
import { HearAndTouchDisplay } from './components/HearAndTouchDisplay'
import { TitleScreen } from './components/TitleScreen'
import { ScoresScreen } from './components/ScoresScreen'
import { useSpeechRecognizer } from './hooks/useSpeechRecognizer'
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis'
import { fuzzyMatch } from './utils/fuzzyMatch'
import { playSuccess, playError } from './utils/soundEffects'
import { buildDeck, getNextWord } from './utils/wordDeck'
import { speakPraise } from './components/Paper'
import { CELEBRATION_KINDS } from './components/Celebrations'
import words from './data/words.json'
import categories from './data/categories.json'
import './App.css'

const PRAISE_PHRASES = ['Brawo!', 'Super!', 'Świetnie!', 'Tak jest!', 'Wspaniale!', 'Pięknie!']

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function pickDistractors(word, allWords, selectedCategories, count = 3) {
  const ids = selectedCategories && selectedCategories.length > 0
    ? selectedCategories : Object.keys(allWords)
  const pool = ids.flatMap(id => allWords[id] ?? []).filter(w => w.word !== word.word)
  // If selected categories don't have enough distractors, pull from all categories
  const fallback = pool.length < count
    ? Object.keys(allWords).flatMap(id => allWords[id] ?? []).filter(w => w.word !== word.word)
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

function loadScores() {
  try { return JSON.parse(localStorage.getItem('słowik_scores')) || [] } catch { return [] }
}
function saveScore({ player, score, mode }) {
  const entries = loadScores()
  entries.push({ player, score, mode, date: new Date().toISOString() })
  entries.sort((a, b) => b.score - a.score)
  localStorage.setItem('słowik_scores', JSON.stringify(entries.slice(0, 50)))
}
function loadPlayers() {
  try { return JSON.parse(localStorage.getItem('słowik_players')) || [] } catch { return [] }
}
function savePlayers(players) {
  localStorage.setItem('słowik_players', JSON.stringify(players.slice(0, 8)))
}

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

  const [screen, setScreen] = useState('title')
  const [player, setPlayer] = useState(
    () => localStorage.getItem('słowik_last_player') || 'Gracz'
  )
  const [players, setPlayers] = useState(() => loadPlayers())
  const [mode, setMode] = useState('say')
  const [selectedCategories, setSelectedCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('słowik_categories')) } catch { return null }
  })
  const [hearOptions, setHearOptions] = useState([])

  const { transcript, error, start, stop, isListening } = useSpeechRecognizer()
  const { speak, isSpeaking } = useSpeechSynthesis()
  const prevIsSpeakingRef = useRef(false)
  const lastProcessedTranscript = useRef('')
  const pendingTimeoutRef = useRef(null)

  // On each new word while game is active: speak (learn mode) or listen directly
  useEffect(() => {
    if (screen !== 'game' || mode === 'hear') return
    lastProcessedTranscript.current = ''
    if (learnMode) {
      speak(currentWord.word)
    } else {
      start()
    }
  }, [currentWord, screen]) // eslint-disable-line react-hooks/exhaustive-deps

  // After TTS finishes (true→false), start listening — but not in hear mode
  useEffect(() => {
    if (prevIsSpeakingRef.current && !isSpeaking && mode !== 'hear') {
      start()
    }
    prevIsSpeakingRef.current = isSpeaking
  }, [isSpeaking]) // eslint-disable-line react-hooks/exhaustive-deps

  // React to speech recognition results
  useEffect(() => {
    if (!transcript || status !== 'listening') return
    if (transcript === lastProcessedTranscript.current) return
    lastProcessedTranscript.current = transcript

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
      pendingTimeoutRef.current = setTimeout(() => {
        pendingTimeoutRef.current = null
        setCelebration(null)
        setWordState(({ deck: d }) => {
          const { word, remainingDeck } = getNextWord(d, words, selectedCategories)
          return { currentWord: word, deck: remainingDeck }
        })
        setStatus('listening')
      }, delay)
    } else {
      setStatus('incorrect')
      playError()
      pendingTimeoutRef.current = setTimeout(() => {
        pendingTimeoutRef.current = null
        setStatus('listening')
        start()
      }, 1500)
    }
  }, [transcript]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode !== 'hear' || screen !== 'game') return
    const distractors = pickDistractors(currentWord, words, selectedCategories)
    setHearOptions(shuffleArray([currentWord, ...distractors]))
    speak(currentWord.word)
  }, [currentWord, mode, screen]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLearnModeChange = (value) => {
    setLearnMode(value)
    localStorage.setItem('learnMode', String(value))
  }

  const handleSpeak = () => {
    if (isListening) stop()
    speak(currentWord.word)
  }

  function handlePlay() {
    const newDeck = buildDeck(words, selectedCategories)
    if (newDeck.length === 0) return
    setWordState({ currentWord: newDeck[0], deck: newDeck.slice(1) })
    setScore(0)
    setStatus('listening')
    setCelebration(null)
    setScreen('game')
  }

  function handleBackToTitle() {
    if (score > 0) saveScore({ player, score, mode })
    setScore(0)
    setStatus('listening')
    setCelebration(null)
    setScreen('title')
  }

  function handlePlayerChange(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    setPlayer(trimmed)
    localStorage.setItem('słowik_last_player', trimmed)
    const prev = loadPlayers().filter(p => p !== trimmed)
    const updated = [trimmed, ...prev]
    savePlayers(updated)
    setPlayers(updated)
  }

  function handleCategoriesChange(cats) {
    setSelectedCategories(cats)
    localStorage.setItem('słowik_categories', JSON.stringify(cats))
  }

  function handleHearSelect(option) {
    if (status !== 'listening') return
    if (option.word === currentWord.word) {
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
      pendingTimeoutRef.current = setTimeout(() => {
        pendingTimeoutRef.current = null
        setCelebration(null)
        setWordState(({ deck: d }) => {
          const { word, remainingDeck } = getNextWord(d, words, selectedCategories)
          return { currentWord: word, deck: remainingDeck }
        })
        setStatus('listening')
      }, delay)
    } else {
      setStatus('incorrect')
      playError()
      pendingTimeoutRef.current = setTimeout(() => {
        pendingTimeoutRef.current = null
        setStatus('listening')
      }, 1500)
    }
  }

  function handleSkip() {
    if (pendingTimeoutRef.current) {
      clearTimeout(pendingTimeoutRef.current)
      pendingTimeoutRef.current = null
    }
    if (isListening) stop()
    setCelebration(null)
    setStatus('listening')
    setWordState(({ deck: d }) => {
      const { word, remainingDeck } = getNextWord(d, words, selectedCategories)
      return { currentWord: word, deck: remainingDeck }
    })
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          ⚠️ Mikrofon niedostępny: {error}. Otwórz w Chrome lub Edge i zezwól na mikrofon.
        </div>
      )}
      {screen === 'title' && (
        <TitleScreen
          player={player}
          players={players}
          mode={mode}
          selectedCategories={selectedCategories}
          categories={categories}
          onPlayerChange={handlePlayerChange}
          onModeChange={setMode}
          onCategoriesChange={handleCategoriesChange}
          onPlay={handlePlay}
          onScores={() => setScreen('scores')}
        />
      )}
      {screen === 'game' && mode === 'say' && (
        <GameDisplay
          word={currentWord}
          score={score}
          status={status}
          celebration={celebration}
          learnMode={learnMode}
          onLearnModeChange={handleLearnModeChange}
          onSpeak={handleSpeak}
          onBack={handleBackToTitle}
          onSkip={handleSkip}
        />
      )}
      {screen === 'game' && mode === 'hear' && (
        <HearAndTouchDisplay
          word={currentWord}
          options={hearOptions}
          score={score}
          status={status}
          celebration={celebration}
          learnMode={learnMode}
          onLearnModeChange={handleLearnModeChange}
          onSelect={handleHearSelect}
          onBack={handleBackToTitle}
          onSpeak={handleSpeak}
          onSkip={handleSkip}
        />
      )}
      {screen === 'scores' && (
        <ScoresScreen
          scores={loadScores()}
          currentPlayer={player}
          onBack={() => setScreen('title')}
        />
      )}
    </div>
  )
}
