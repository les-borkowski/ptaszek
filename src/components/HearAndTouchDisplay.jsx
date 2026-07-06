import { PALETTE, PaperChain, SpeechBubble, MicButton, SkipButton, WordImage, WordLabel } from './Paper'
import { Celebration } from './Celebrations'

export function HearAndTouchDisplay({
  word, options, score, status, celebration, onSelect, onBack, onSpeak, onSkip = () => {},
  learnMode = false, onLearnModeChange = () => {},
  showTranslation = false, onShowTranslationChange = () => {},
}) {
  return (
    <div className="game-shell">
      <div className="game-kraft">
        <div className="game-shell-inner hat-screen">
          <div className="sr-only" aria-live="polite">Punkty: {score}</div>

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

          {/* Learn-mode word label — always occupies its slot so the grid below never
              shifts; only its visibility toggles with the 🤫 toggle. */}
          <div className={`hat-word-label${learnMode ? '' : ' hat-word-label--hidden'}`} aria-hidden={!learnMode}>
            <WordLabel word={word} size={160} showTranslation={showTranslation} />
          </div>

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
            <label
              className={`hint-badge hint-badge--en${showTranslation ? ' hint-badge--on' : ''}`}
              data-tooltip="Pokaż tłumaczenie"
            >
              <input
                type="checkbox"
                checked={showTranslation}
                onChange={(e) => onShowTranslationChange(e.target.checked)}
                aria-label="Pokaż tłumaczenie angielskie"
              />
              🇬🇧
            </label>
            <label
              className={`hint-badge${learnMode ? ' hint-badge--on' : ''}`}
              data-tooltip="Tryb nauki"
            >
              <input
                type="checkbox"
                checked={learnMode}
                onChange={(e) => onLearnModeChange(e.target.checked)}
                aria-label="Tryb nauki: pokaż i wymów słowo"
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
