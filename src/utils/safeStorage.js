// localStorage can throw (private browsing, quota, disabled storage) and
// stored JSON can be corrupt — every accessor swallows those and falls back.
export function getString(key, fallback = null) {
  try {
    const value = localStorage.getItem(key)
    return value === null ? fallback : value
  } catch {
    return fallback
  }
}

export function setString(key, value) {
  try { localStorage.setItem(key, value) } catch { /* ignore */ }
}

export function getJSON(key, fallback = null) {
  try {
    const value = JSON.parse(localStorage.getItem(key))
    return value === null || value === undefined ? fallback : value
  } catch {
    return fallback
  }
}

export function setJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}
