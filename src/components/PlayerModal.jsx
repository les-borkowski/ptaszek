import { useState } from 'react'

export function PlayerModal({ players, current, onClose, onSelect }) {
  const [input, setInput] = useState('')

  function handleSubmit() {
    const name = input.trim()
    if (!name) return
    onSelect(name)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700, fontSize: 20 }}>Wybierz gracza</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {players.length > 0 && (
          <div className="player-chips">
            {players.map(p => (
              <button
                key={p}
                className={`player-chip${p === current ? ' player-chip--active' : ''}`}
                onClick={() => onSelect(p)}
              >{p}</button>
            ))}
          </div>
        )}

        <div className="modal-divider">— lub wpisz nowe —</div>

        <input
          className="player-input"
          type="text"
          placeholder="Imię gracza…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />

        <button className="modal-done-btn" onClick={handleSubmit}>Gotowe!</button>
      </div>
    </div>
  )
}
