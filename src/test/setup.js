import '@testing-library/jest-dom'

// Node 22+ provides a native localStorage (for --experimental-webstorage) that
// leaks into the jsdom environment when both are active. Replace it with a
// reliable in-memory mock so tests can call getItem/setItem/removeItem/clear.
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
