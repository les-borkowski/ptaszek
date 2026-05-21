/**
 * Pure presentational component. All game logic lives in App.jsx.
 *
 * @param {{ word: {id:number, polish:string, english:string, image:string}, score: number, status: 'listening'|'correct'|'incorrect' }} props
 */
export function GameDisplay({ word, score, status }) {
  return (
    <div className="game-display">
      <div className="score">
        <span className="score-label">Punkty: </span>
        <span className="score-value">{score}</span>
      </div>

      <div
        data-testid="image-container"
        className={`image-container ${status}`}
      >
        <span className="word-image">{word.image}</span>
      </div>

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
