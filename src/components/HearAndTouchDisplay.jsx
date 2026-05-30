import { PALETTE, PaperChain } from './Paper'
import { Celebration } from './Celebrations'

export function HearAndTouchDisplay({
  word, options, score, status, celebration, onSelect, onBack,
}) {
  return (
    <div className="game-shell">
      <div className="game-kraft">
        <div className="game-shell-inner hat-screen">

          {/* Header — back nav + score (left)  |  mode title (right) */}
          <div className="game-header">
            <div className="game-header-start">
              <button className="back-btn" onClick={onBack} aria-label="Wróć do menu">
                ← wróć
              </button>
              <PaperChain score={score} size="md" />
            </div>
            <div className="hat-mode-label">
              <span aria-hidden="true">👂</span> Usłysz i dotknij
            </div>
          </div>

          <div className="hat-prompt">
            {status === 'listening' && 'Dotknij właściwy obrazek!'}
            {status === 'correct'   && <span style={{ color: PALETTE.mint }}>Brawo!</span>}
            {status === 'incorrect' && <span style={{ color: PALETTE.rose }}>Spróbuj jeszcze raz…</span>}
          </div>

          <div className={`hat-grid${status === 'incorrect' ? ' hat-grid--shake' : ''}`}>
            {options.map((opt, i) => (
              <button
                key={`${opt.word}-${i}`}
                className="hat-card"
                onClick={() => onSelect(opt)}
                disabled={status !== 'listening'}
              >
                <span className="hat-emoji">{opt.emoji}</span>
              </button>
            ))}
          </div>

          {status === 'correct' && celebration && (
            <div className="celebration-overlay">
              <Celebration kind={celebration.kind} word={word} playKey={celebration.key} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
