export function GameDisplay({
  word,
  score,
  status,
  learnMode = false,
  onLearnModeChange = () => {},
  onSpeak = () => {},
}) {
  return (
    <div className="game-display">
      <div className="top-bar">
        <div className="score">
          <span className="score-label">Punkty: </span>
          <span className="score-value">{score}</span>
        </div>
        <label className="learn-mode-toggle">
          <input
            type="checkbox"
            checked={learnMode}
            onChange={(e) => onLearnModeChange(e.target.checked)}
          />
          Podpowiedz
        </label>
      </div>

      <div
        data-testid="image-container"
        className={`image-container ${status}`}
      >
        <span className="word-image">{word.image}</span>
      </div>

      <button
        className="speaker-button"
        onClick={onSpeak}
        aria-label="Wymów słowo"
      >
        🔊
      </button>

      <div
        data-testid="status-indicator"
        className={`status-indicator ${status}`}
      >
        {status === 'listening' && '🎤 Mów!'}
        {status === 'correct' && '⭐ Brawo!'}
        {status === 'incorrect' && '🔄 Spróbuj jeszcze raz!'}
      </div>
    </div>
  )
}
