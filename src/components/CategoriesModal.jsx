export function CategoriesModal({ categories, selected, onClose, onChange }) {
  const allSelected = selected === null || selected === undefined
  const noneSelected = selected !== null && selected !== undefined && selected.length === 0

  function toggleAll() {
    onChange(null)
  }

  function toggleNone() {
    onChange([])
  }

  function toggleCategory(id) {
    const currentIds = allSelected ? categories.map(c => c.id) : [...(selected || [])]
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

        <div className="cat-all-none">
          <button className={`cat-row cat-row--half${allSelected ? ' cat-row--mustard' : ''}`} onClick={toggleAll}>
            Wszystkie
          </button>
          <button className={`cat-row cat-row--half${noneSelected ? ' cat-row--slate' : ''}`} onClick={toggleNone}>
            Żadne
          </button>
        </div>

        <div className="cat-scroll">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`cat-row${isCategorySelected(cat.id) ? ' cat-row--mint' : ''}`}
              onClick={() => toggleCategory(cat.id)}
            >
              <span>{cat.emoji}</span><span>{cat.label}</span>
            </button>
          ))}
        </div>

        <button className="modal-done-btn" onClick={onClose}>Gotowe!</button>
      </div>
    </div>
  )
}
