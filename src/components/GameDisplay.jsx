import { PaperChain, SpeechBubble, MicButton, PaperBadge, PALETTE } from './Paper'
import { Scene, nextStageAt } from './Scenery'
import { WordTransition } from './Transitions'
import { Celebration } from './Celebrations'

/* =====================================================
   GameDisplay — the cut-paper game screen.
   Layers:
     0. Kraft paper background + grid texture
     1. Scene (sun, mountains, hills, grass, trees, house, birds)
     2. Header: paper chain (left) + speech-bubble prompt (right)
     3. Word card center (with random transition)
     4. Feedback line ("Brawo!" / "Hmm…")
     5. Controls: learn-mode toggle, mic button
     6. Celebration overlay (when status==='correct')
   ===================================================== */

export function GameDisplay({
  word,
  score,
  status,
  celebration,
  learnMode = false,
  onLearnModeChange = () => {},
  onSpeak = () => {},
  onBack = () => {},
}) {
  const next = nextStageAt(score)
  return (
    <div className="game-shell">
      <div className="game-kraft">
        {/* Scene background */}
        <Scene score={score} />

        <div className="game-shell-inner">
          {/* Header — paper chain + prompt */}
          <div className="game-header">
            <PaperChain score={score} size="md" />
            {status === 'listening' && (
              <SpeechBubble>Powiedz słowo!</SpeechBubble>
            )}
            {status === 'correct' && (
              <SpeechBubble style={{ background: PALETTE.mint }}>Brawo!</SpeechBubble>
            )}
            {status === 'incorrect' && (
              <SpeechBubble style={{ background: PALETTE.rose }}>Spróbuj jeszcze raz…</SpeechBubble>
            )}
          </div>

          {/* Word card */}
          <div className={`word-area status-${status}`}>
            <WordTransition word={word} size={250} />
            {status === 'correct' && celebration && (
              <div className="celebration-overlay">
                <Celebration kind={celebration.kind} word={word} playKey={celebration.key} />
              </div>
            )}
          </div>

          {/* Footer area — next milestone hint */}
          <div className="game-footer">
            {next != null && (
              <PaperBadge color={PALETTE.cream} rotate={-2} size={12}>
                Następny etap za {next - score}
              </PaperBadge>
            )}
          </div>

          {/* Controls — mic + hint badge cluster (bottom-right) */}
          <div className="mic-cluster">
            <label className={`hint-badge${learnMode ? ' hint-badge--on' : ''}`}>
              <input
                type="checkbox"
                checked={learnMode}
                onChange={(e) => onLearnModeChange(e.target.checked)}
              />
              🤫
            </label>
            <MicButton onClick={onSpeak} />
          </div>

          <button className="back-btn" onClick={onBack} aria-label="Wróć do menu">
            ← wróć
          </button>

        </div>
      </div>
    </div>
  )
}
