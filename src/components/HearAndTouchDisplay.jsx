import { PALETTE, PaperChain, SpeechBubble, MicButton, SkipButton, WordImage, WordLabel } from './Paper'
import { Celebration } from './Celebrations'

export function HearAndTouchDisplay({
  word, options, score, status, celebration, onSelect, onBack, onSpeak, onSkip = () => {},
  learnMode = false, onLearnModeChange = () => {},
}) {
  return (
    <div className="game-shell">
      <div className="game-kraft">
        <div className="game-shell-inner hat-screen">

          {/* Header — back nav + score (left)  |  game title bubble (right) */}
          <div className="game-header">
            <div className="game-header-start">
              <button className="back-btn" onClick={onBack} aria-label="Wróć do menu">
                ← wróć
              </button>
              <PaperChain score={score} size="md" />
            </div>
            {status === 'listening' && (
              <SpeechBubble>Usłysz i dotknij</SpeechBubble>
            )}
            {status === 'correct' && (
              <SpeechBubble style={{ background: PALETTE.mint }}>Brawo!</SpeechBubble>
            )}
            {status === 'incorrect' && (
              <SpeechBubble style={{ background: PALETTE.rose }}>Spróbuj jeszcze raz…</SpeechBubble>
            )}
          </div>

          {/* Learn-mode word label — revealed above the grid when the 🤫 toggle is on */}
          {learnMode && (
            <div className="hat-word-label">
              <WordLabel word={word} size={160} />
            </div>
          )}

          {/* 2×2 image card grid — centred vertically via auto margins */}
          <div className={`hat-grid${status === 'incorrect' ? ' hat-grid--shake' : ''}`}>
            {options.map((opt, i) => (
              <button
                key={`${opt.word}-${i}`}
                className="hat-card"
                onClick={() => onSelect(opt)}
                disabled={status !== 'listening'}
                aria-label={opt.word}
              >
                <WordImage word={opt} size={56} fill />
              </button>
            ))}
          </div>

          {/* Footer — skip control (bottom-left) */}
          <div className="game-footer">
            <SkipButton onClick={onSkip} />
          </div>

          {/* Speaker button + learn-mode toggle (mirrors GameDisplay mic-cluster) */}
          <div className="mic-cluster">
            <label className={`hint-badge${learnMode ? ' hint-badge--on' : ''}`}>
              <input
                type="checkbox"
                checked={learnMode}
                onChange={(e) => onLearnModeChange(e.target.checked)}
              />
              🤫
            </label>
            <MicButton
              onClick={onSpeak}
              label="🔊"
              ariaLabel="Posłuchaj słowa"
              color={PALETTE.navy}
              disabled={status !== 'listening'}
            />
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
