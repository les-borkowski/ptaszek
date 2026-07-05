import { PALETTE, PaperChain, SpeechBubble, MicButton, PaperBadge, WordImage } from './Paper'
import { Celebration } from './Celebrations'
import { nextStageAt } from './Scenery'

export function HearAndTouchDisplay({
  word, options, score, status, celebration, onSelect, onBack, onSpeak,
}) {
  const next = nextStageAt(score)
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

          {/* Footer — next milestone hint (mirrors GameDisplay) */}
          <div className="game-footer">
            {next != null && (
              <PaperBadge color={PALETTE.cream} rotate={-2} size={12}>
                Następny etap za {next - score}
              </PaperBadge>
            )}
          </div>

          {/* Speaker button — replay the spoken word (mirrors GameDisplay mic-cluster) */}
          <div className="mic-cluster">
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
