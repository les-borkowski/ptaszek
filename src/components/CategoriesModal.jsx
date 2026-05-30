export function CategoriesModal({ categories, selected, onClose, onChange }) {
  const allSelected = !selected || selected.length === 0

  function toggleAll() {
    onChange(allSelected ? categories.map(c => c.id) : null)
  }

  function toggleCategory(id) {
    const currentIds = allSelected ? categories.map(c => c.id) : [...selected]
    const isOn = currentIds.includes(id)
    const next = isOn ? currentIds.filter(x => x !== id) : [...currentIds, id]
    onChange(next.length === categories.length ? null : next)
  }

  function isCategorySelected(id) {
    return allSelected || (selected && selected.includes(id))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700, fontSize: 20 }}>Kategorie</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <button className={`cat-row${allSelected ? ' cat-row--mustard' : ''}`} onClick={toggleAll}>
          Wszystkie
        </button>

        {categories.map(cat => (
          <button
            key={cat.id}
            className={`cat-row${isCategorySelected(cat.id) ? ' cat-row--mint' : ''}`}
            onClick={() => toggleCategory(cat.id)}
          >
            <span>{cat.emoji}</span><span>{cat.label}</span>
          </button>
        ))}

        <button className="modal-done-btn" onClick={onClose}>Gotowe!</button>
      </div>
    </div>
  )
}
