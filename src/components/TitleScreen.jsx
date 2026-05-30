import { useState } from 'react'
import { PaperLayer, PALETTE } from './Paper'
import { CategoriesModal } from './CategoriesModal'
import { PlayerModal } from './PlayerModal'

export function TitleScreen({
  player, players, mode, selectedCategories, categories,
  onPlayerChange, onModeChange, onCategoriesChange, onPlay, onScores,
}) {
  const [showCategories, setShowCategories] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)

  const allSelected = !selectedCategories || selectedCategories.length === 0
  const catSummary = allSelected ? 'Wszystkie ✓' : `${selectedCategories.length} wybrane`

  return (
    <div className="game-shell">
      <div className="game-kraft">
        <div className="game-shell-inner title-screen">

          <div className="title-logo">
            <span className="title-bird">🐦</span>
            <div className="title-name">Ptaszek</div>
            <div className="title-tagline">nauka polskiego</div>
          </div>

          <PaperLayer color={PALETTE.cream} shadow={4} style={{
            borderRadius: 14, padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.6 }}>Gracz</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{player}</span>
            <button className="change-link" onClick={() => setShowPlayer(true)}>zmień ✎</button>
          </PaperLayer>

          <div className="mode-toggle">
            <button
              className={`mode-chip${mode === 'say' ? ' mode-chip--active' : ''}`}
              onClick={() => onModeChange('say')}
            >🎤 Powiedz słowo</button>
            <button
              className={`mode-chip${mode === 'hear' ? ' mode-chip--active' : ''}`}
              onClick={() => onModeChange('hear')}
            >👂 Usłysz i dotknij</button>
          </div>

          <button className="categories-btn" onClick={() => setShowCategories(true)}>
            <span>🗂 Kategorie</span>
            <span className="cat-summary">{catSummary}</span>
          </button>

          <button className="play-btn" onClick={onPlay}>▶ Graj!</button>
          <button className="scores-btn" onClick={onScores}>🏆 Najlepsze wyniki</button>

        </div>
      </div>

      {showCategories && (
        <CategoriesModal
          categories={categories}
          selected={selectedCategories}
          onClose={() => setShowCategories(false)}
          onChange={onCategoriesChange}
        />
      )}
      {showPlayer && (
        <PlayerModal
          players={players}
          current={player}
          onClose={() => setShowPlayer(false)}
          onSelect={(name) => { onPlayerChange(name); setShowPlayer(false) }}
        />
      )}
    </div>
  )
}
