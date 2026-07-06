import { PaperChain, SpeechBubble, MicButton, SkipButton, PALETTE } from './Paper'
import { Scene } from './Scenery'
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
     5. Controls: skip button (bottom-left), learn-mode toggle + mic button (bottom-right)
     6. Celebration overlay (when status==='correct')
   ===================================================== */

export function GameDisplay({
  word,
  score,
  status,
  celebration,
  learnMode = false,
  onLearnModeChange = () => {},
  showTranslation = false,
  onShowTranslationChange = () => {},
  isListening = false,
  onSpeak = () => {},
  onBack = () => {},
  onSkip = () => {},
}) {
  return (
    <div className="game-shell">
      <div className="game-kraft">
        {/* Scene background */}
        <Scene score={score} />

        <div className="game-shell-inner">
          <div className="sr-only" aria-live="polite">Punkty: {score}</div>
          {/* Header — back nav + paper chain (left) | prompt bubble (right) */}
          <div className="game-header">
            <div className="game-header-start">
              <button className="back-btn" onClick={onBack} aria-label="Wróć do menu">
                ← wróć
              </button>
              <PaperChain score={score} size="md" />
            </div>
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
            <WordTransition word={word} size={250} showTranslation={showTranslation} />
            {status === 'correct' && celebration && (
              <div className="celebration-overlay">
                <Celebration kind={celebration.kind} word={word} playKey={celebration.key} />
              </div>
            )}
          </div>

          {/* Footer area — skip control (bottom-left) */}
          <div className="game-footer">
            <SkipButton onClick={onSkip} />
          </div>

          {/* Controls — mic + hint badge cluster (bottom-right) */}
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
            <MicButton onClick={onSpeak} listening={isListening} />
          </div>

        </div>
      </div>
    </div>
  )
}
