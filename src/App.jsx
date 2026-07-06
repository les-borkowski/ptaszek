import { useState } from 'react'
import { GameDisplay } from './components/GameDisplay'
import { HearAndTouchDisplay } from './components/HearAndTouchDisplay'
import { TitleScreen } from './components/TitleScreen'
import { ScoresScreen } from './components/ScoresScreen'
import { useGameLoop } from './hooks/useGameLoop'
import { getString, setString, getJSON, setJSON } from './utils/safeStorage'
import words from './data/words.json'
import categories from './data/categories.json'
import './App.css'

function loadScores() {
  return getJSON('słowik_scores', [])
}
function saveScore({ player, score, mode }) {
  const entries = loadScores()
  entries.push({ player, score, mode, date: new Date().toISOString() })
  entries.sort((a, b) => b.score - a.score)
  setJSON('słowik_scores', entries.slice(0, 50))
}
function loadPlayers() {
  return getJSON('słowik_players', [])
}
function savePlayers(players) {
  setJSON('słowik_players', players.slice(0, 8))
}

export default function App() {
  const [learnMode, setLearnMode] = useState(
    () => getString('learnMode') === 'true'
  )
  const [showTranslation, setShowTranslation] = useState(
    () => getString('słowik_show_translation') === 'true'
  )

  const [screen, setScreen] = useState('title')
  const [player, setPlayer] = useState(
    () => getString('słowik_last_player') || 'Gracz'
  )
  const [players, setPlayers] = useState(() => loadPlayers())
  const [mode, setMode] = useState('say')
  const [selectedCategories, setSelectedCategories] = useState(
    () => getJSON('słowik_categories')
  )

  const {
    currentWord, score, status, celebration, hearOptions, error, isListening,
    handleSpeak, handleSkip, handleHearSelect, resetGame,
  } = useGameLoop({ words, selectedCategories, mode, screen, learnMode })

  const handleLearnModeChange = (value) => {
    setLearnMode(value)
    setString('learnMode', String(value))
  }

  const handleShowTranslationChange = (value) => {
    setShowTranslation(value)
    setString('słowik_show_translation', String(value))
  }

  function handlePlay() {
    if (resetGame()) setScreen('game')
  }

  function handleBackToTitle() {
    if (score > 0) saveScore({ player, score, mode })
    resetGame()
    setScreen('title')
  }

  function handlePlayerChange(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    setPlayer(trimmed)
    setString('słowik_last_player', trimmed)
    const prev = loadPlayers().filter(p => p !== trimmed)
    const updated = [trimmed, ...prev]
    savePlayers(updated)
    setPlayers(updated)
  }

  function handleCategoriesChange(cats) {
    setSelectedCategories(cats)
    setJSON('słowik_categories', cats)
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
          isListening={isListening}
          onLearnModeChange={handleLearnModeChange}
          showTranslation={showTranslation}
          onShowTranslationChange={handleShowTranslationChange}
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
          showTranslation={showTranslation}
          onShowTranslationChange={handleShowTranslationChange}
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
