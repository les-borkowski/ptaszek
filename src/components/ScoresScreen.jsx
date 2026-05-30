import { PALETTE, PaperLayer } from './Paper'

const MEDALS = ['🥇', '🥈', '🥉']
const MODE_TAG = { say: '🎤', hear: '👂' }

export function ScoresScreen({ scores, currentPlayer, onBack }) {
  const top = scores.slice(0, 10)
  return (
    <div className="game-shell">
      <div className="game-kraft">
        <div className="game-shell-inner scores-screen">

          <div className="scores-header">
            <button className="back-btn" style={{ position: 'static' }} onClick={onBack}>← wróć</button>
            <div className="scores-title">🏆 Najlepsze wyniki</div>
          </div>

          {top.length === 0 ? (
            <div className="scores-empty">Jeszcze brak wyników — zagraj!</div>
          ) : (
            <div className="scores-list">
              {top.map((entry, i) => (
                <PaperLayer
                  key={i}
                  color={PALETTE.cream}
                  shadow={4}
                  style={{
                    borderRadius: 14, padding: '10px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    ...(entry.player === currentPlayer && {
                      outline: `3px solid ${PALETTE.coral}`,
                      outlineOffset: '-3px',
                    }),
                  }}
                >
                  <span className="score-rank">{i < 3 ? MEDALS[i] : `${i + 1}.`}</span>
                  <span className="score-name">{entry.player}</span>
                  <span className="score-value">{entry.score}</span>
                  <span className="score-mode">{MODE_TAG[entry.mode] ?? '🎤'}</span>
                </PaperLayer>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
