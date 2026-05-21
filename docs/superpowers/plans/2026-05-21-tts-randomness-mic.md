# TTS Learn Mode, Shuffle Deck, Mic Watchdog — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add TTS learn mode (app speaks Polish word before listening), a shuffle-deck word randomiser, and a silent mic watchdog to the Polish language learning game.

**Architecture:** New `useSpeechSynthesis` hook wraps `window.speechSynthesis`; `useSpeechRecognizer` gains a watchdog timer and suppresses `aborted` errors; `App.jsx` replaces single-exclusion random with a Fisher-Yates shuffle deck and orchestrates TTS→listen flow; `GameDisplay` gains a speaker button and learn-mode toggle.

**Tech Stack:** React 19, Vite, Vitest, @testing-library/react, Web Speech API (`speechSynthesis`, `webkitSpeechRecognition`)

**Spec:** `docs/superpowers/specs/2026-05-21-tts-randomness-mic-design.md`

---

## File map

| Status | File | Purpose |
|--------|------|---------|
| Create | `src/hooks/useSpeechSynthesis.js` | Wraps `window.speechSynthesis`; exposes `speak(text)` and `isSpeaking` |
| Create | `src/hooks/useSpeechSynthesis.test.js` | Unit tests for the hook |
| Create | `src/utils/wordDeck.js` | `buildDeck` (Fisher-Yates shuffle) and `getNextWord` (pop from deck, refill when empty) |
| Create | `src/utils/wordDeck.test.js` | Unit tests for deck utilities |
| Modify | `src/hooks/useSpeechRecognizer.js` | Add 8 s watchdog timer; suppress `aborted` errors |
| Modify | `src/hooks/useSpeechRecognizer.test.js` | Tests for watchdog and aborted suppression |
| Modify | `src/components/GameDisplay.jsx` | Add speaker button (`🔊`) and "Podpowiedz" toggle |
| Modify | `src/components/GameDisplay.test.jsx` | Tests for new UI elements |
| Modify | `src/App.jsx` | Wire TTS→listen flow; replace `getRandomWord` with deck; add learn mode state |
| Modify | `src/App.test.jsx` | Mock `useSpeechSynthesis`; update/add tests |
| Modify | `src/App.css` | Styles for `.top-bar`, `.learn-mode-toggle`, `.speaker-button` |

---

## Task 1 — `useSpeechSynthesis` hook

**Files:**
- Create: `src/hooks/useSpeechSynthesis.js`
- Create: `src/hooks/useSpeechSynthesis.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/hooks/useSpeechSynthesis.test.js`:

```js
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSpeechSynthesis } from './useSpeechSynthesis'

describe('useSpeechSynthesis', () => {
  let mockUtterance
  let mockSynth

  beforeEach(() => {
    mockUtterance = { lang: '', onstart: null, onend: null, onerror: null }
    vi.stubGlobal('SpeechSynthesisUtterance', vi.fn(() => mockUtterance))
    mockSynth = { cancel: vi.fn(), speak: vi.fn() }
    vi.stubGlobal('speechSynthesis', mockSynth)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts with isSpeaking false', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    expect(result.current.isSpeaking).toBe(false)
  })

  it('cancels existing speech and speaks the utterance', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('pies') })
    expect(mockSynth.cancel).toHaveBeenCalled()
    expect(mockSynth.speak).toHaveBeenCalledWith(mockUtterance)
    expect(mockUtterance.lang).toBe('pl-PL')
  })

  it('accepts a custom lang', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('dog', 'en-US') })
    expect(mockUtterance.lang).toBe('en-US')
  })

  it('sets isSpeaking true on utterance onstart', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('pies') })
    act(() => { mockUtterance.onstart() })
    expect(result.current.isSpeaking).toBe(true)
  })

  it('sets isSpeaking false on utterance onend', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('pies') })
    act(() => { mockUtterance.onstart() })
    act(() => { mockUtterance.onend() })
    expect(result.current.isSpeaking).toBe(false)
  })

  it('sets isSpeaking false on utterance onerror', () => {
    const { result } = renderHook(() => useSpeechSynthesis())
    act(() => { result.current.speak('pies') })
    act(() => { mockUtterance.onstart() })
    act(() => { mockUtterance.onerror() })
    expect(result.current.isSpeaking).toBe(false)
  })

  it('does nothing if speechSynthesis is unavailable', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const { result } = renderHook(() => useSpeechSynthesis())
    expect(() => act(() => { result.current.speak('pies') })).not.toThrow()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test -- --reporter=verbose src/hooks/useSpeechSynthesis.test.js
```

Expected: all tests fail with "Cannot find module" or similar.

- [ ] **Step 3: Implement `useSpeechSynthesis`**

Create `src/hooks/useSpeechSynthesis.js`:

```js
import { useState, useCallback } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const speak = useCallback((text, lang = 'pl-PL') => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  return { speak, isSpeaking }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- --reporter=verbose src/hooks/useSpeechSynthesis.test.js
```

Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSpeechSynthesis.js src/hooks/useSpeechSynthesis.test.js
git commit -m "feat: add useSpeechSynthesis hook"
```

---

## Task 2 — Shuffle-deck utilities

**Files:**
- Create: `src/utils/wordDeck.js`
- Create: `src/utils/wordDeck.test.js`

- [ ] **Step 1: Write the failing tests**

Create `src/utils/wordDeck.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { buildDeck, getNextWord } from './wordDeck'

const mockWords = [
  { id: 1, polish: 'pies', english: 'dog', image: '🐶' },
  { id: 2, polish: 'kot', english: 'cat', image: '🐱' },
  { id: 3, polish: 'koń', english: 'horse', image: '🐴' },
]

describe('buildDeck', () => {
  it('returns an array containing all input words', () => {
    const deck = buildDeck(mockWords)
    expect(deck).toHaveLength(3)
    expect(deck.map((w) => w.id).sort((a, b) => a - b)).toEqual([1, 2, 3])
  })

  it('does not mutate the input array', () => {
    const original = mockWords.map((w) => ({ ...w }))
    buildDeck(mockWords)
    expect(mockWords).toEqual(original)
  })

  it('produces different orderings across multiple calls', () => {
    const orderings = new Set()
    for (let i = 0; i < 30; i++) {
      orderings.add(buildDeck(mockWords).map((w) => w.id).join(','))
    }
    expect(orderings.size).toBeGreaterThan(1)
  })
})

describe('getNextWord', () => {
  it('returns the first word from a non-empty deck', () => {
    const deck = [mockWords[1], mockWords[2], mockWords[0]]
    const { word } = getNextWord(deck, mockWords)
    expect(word).toBe(mockWords[1])
  })

  it('returns the rest of the deck as remainingDeck', () => {
    const deck = [mockWords[1], mockWords[2], mockWords[0]]
    const { remainingDeck } = getNextWord(deck, mockWords)
    expect(remainingDeck).toHaveLength(2)
    expect(remainingDeck).not.toContain(mockWords[1])
  })

  it('reshuffles all words when deck is empty', () => {
    const { word, remainingDeck } = getNextWord([], mockWords)
    expect(mockWords).toContain(word)
    const allIds = [word.id, ...remainingDeck.map((w) => w.id)].sort((a, b) => a - b)
    expect(allIds).toEqual([1, 2, 3])
  })

  it('reshuffled deck has length allWords.length - 1', () => {
    const { remainingDeck } = getNextWord([], mockWords)
    expect(remainingDeck).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test -- --reporter=verbose src/utils/wordDeck.test.js
```

Expected: all tests fail with "Cannot find module".

- [ ] **Step 3: Implement `wordDeck`**

Create `src/utils/wordDeck.js`:

```js
export function buildDeck(words) {
  const deck = [...words]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function getNextWord(deck, allWords) {
  if (deck.length === 0) {
    const newDeck = buildDeck(allWords)
    return { word: newDeck[0], remainingDeck: newDeck.slice(1) }
  }
  return { word: deck[0], remainingDeck: deck.slice(1) }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- --reporter=verbose src/utils/wordDeck.test.js
```

Expected: all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/utils/wordDeck.js src/utils/wordDeck.test.js
git commit -m "feat: add Fisher-Yates shuffle deck utilities"
```

---

## Task 3 — Watchdog timer and `aborted` suppression in `useSpeechRecognizer`

**Files:**
- Modify: `src/hooks/useSpeechRecognizer.js`
- Modify: `src/hooks/useSpeechRecognizer.test.js`

- [ ] **Step 1: Write the failing tests**

Append to the `describe('useSpeechRecognizer')` block in `src/hooks/useSpeechRecognizer.test.js`:

```js
  describe('watchdog', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    test('restarts recognition after 8 s with no result', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      expect(mockRecognition.start).toHaveBeenCalledTimes(1)

      act(() => { vi.advanceTimersByTime(8000) })

      expect(mockRecognition.stop).toHaveBeenCalledTimes(1)
      expect(mockRecognition.start).toHaveBeenCalledTimes(2)
    })

    test('watchdog is cancelled when onresult fires', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      act(() => {
        mockRecognition.onresult({ results: [[{ transcript: 'pies' }]], resultIndex: 0 })
      })
      act(() => { vi.advanceTimersByTime(8000) })
      expect(mockRecognition.start).toHaveBeenCalledTimes(1)
    })

    test('watchdog is cancelled when onend fires', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      act(() => { mockRecognition.onend() })
      act(() => { vi.advanceTimersByTime(8000) })
      expect(mockRecognition.start).toHaveBeenCalledTimes(1)
    })

    test('watchdog is cancelled when stop() is called', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      act(() => { result.current.stop() })
      act(() => { vi.advanceTimersByTime(8000) })
      expect(mockRecognition.start).toHaveBeenCalledTimes(1)
    })
  })

  describe('aborted error', () => {
    test('aborted onerror does not set error state', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      act(() => { mockRecognition.onerror({ error: 'aborted' }) })
      expect(result.current.error).toBeNull()
    })

    test('non-aborted onerror still sets error state', () => {
      const { result } = renderHook(() => useSpeechRecognizer())
      act(() => { result.current.start() })
      act(() => { mockRecognition.onerror({ error: 'not-allowed' }) })
      expect(result.current.error).toBe('not-allowed')
    })
  })
```

- [ ] **Step 2: Run tests to verify the new ones fail**

```bash
npm run test -- --reporter=verbose src/hooks/useSpeechRecognizer.test.js
```

Expected: the 6 new tests fail; the existing 7 tests still pass.

- [ ] **Step 3: Implement watchdog and aborted suppression**

Replace `src/hooks/useSpeechRecognizer.js` with:

```js
import { useState, useRef, useCallback } from 'react'

const WATCHDOG_MS = 8000

export function useSpeechRecognizer() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const watchdogRef = useRef(null)
  const startRef = useRef(null)

  const start = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.')
      return
    }

    let recognition
    try {
      recognition = new SpeechRecognition()
    } catch {
      recognition = SpeechRecognition()
    }
    recognition.lang = 'pl-PL'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (event) => {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current)
        watchdogRef.current = null
      }
      const text = event.results[event.resultIndex][0].transcript
      setTranscript(text)
    }

    recognition.onerror = (event) => {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current)
        watchdogRef.current = null
      }
      if (event.error === 'aborted') return
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      if (watchdogRef.current) {
        clearTimeout(watchdogRef.current)
        watchdogRef.current = null
      }
      setIsListening(false)
    }

    recognitionRef.current = recognition
    setTranscript('')
    setError(null)
    setIsListening(true)
    recognition.start()

    if (watchdogRef.current) clearTimeout(watchdogRef.current)
    watchdogRef.current = setTimeout(() => {
      watchdogRef.current = null
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (_) {}
      }
      startRef.current?.()
    }, WATCHDOG_MS)
  }, [])

  startRef.current = start

  const stop = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current)
      watchdogRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  return { isListening, transcript, error, start, stop }
}
```

- [ ] **Step 4: Run all recognizer tests to verify they pass**

```bash
npm run test -- --reporter=verbose src/hooks/useSpeechRecognizer.test.js
```

Expected: all 13 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSpeechRecognizer.js src/hooks/useSpeechRecognizer.test.js
git commit -m "feat: add watchdog timer and suppress aborted errors in useSpeechRecognizer"
```

---

## Task 4 — `GameDisplay` speaker button and learn-mode toggle

**Files:**
- Modify: `src/components/GameDisplay.jsx`
- Modify: `src/components/GameDisplay.test.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Write the failing tests**

Add to the `describe('GameDisplay')` block in `src/components/GameDisplay.test.jsx`:

```jsx
import userEvent from '@testing-library/user-event'
```

Add this import at the top of the file (after the existing imports), then add to the describe block:

```jsx
  test('renders a speaker button', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" onSpeak={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Wymów słowo/i })).toBeInTheDocument()
  })

  test('speaker button is always enabled', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" isSpeaking={true} onSpeak={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Wymów słowo/i })).toBeEnabled()
  })

  test('calls onSpeak when speaker button is clicked', async () => {
    const onSpeak = vi.fn()
    render(<GameDisplay word={mockWord} score={0} status="listening" onSpeak={onSpeak} />)
    await userEvent.click(screen.getByRole('button', { name: /Wymów słowo/i }))
    expect(onSpeak).toHaveBeenCalledTimes(1)
  })

  test('renders Podpowiedz learn-mode toggle', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" learnMode={false} onLearnModeChange={vi.fn()} />)
    expect(screen.getByLabelText(/Podpowiedz/i)).toBeInTheDocument()
  })

  test('toggle checkbox reflects learnMode=false', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" learnMode={false} onLearnModeChange={vi.fn()} />)
    expect(screen.getByLabelText(/Podpowiedz/i)).not.toBeChecked()
  })

  test('toggle checkbox reflects learnMode=true', () => {
    render(<GameDisplay word={mockWord} score={0} status="listening" learnMode={true} onLearnModeChange={vi.fn()} />)
    expect(screen.getByLabelText(/Podpowiedz/i)).toBeChecked()
  })

  test('calls onLearnModeChange(true) when unchecked toggle is clicked', async () => {
    const onChange = vi.fn()
    render(<GameDisplay word={mockWord} score={0} status="listening" learnMode={false} onLearnModeChange={onChange} />)
    await userEvent.click(screen.getByLabelText(/Podpowiedz/i))
    expect(onChange).toHaveBeenCalledWith(true)
  })
```

- [ ] **Step 2: Run tests to verify the new ones fail**

```bash
npm run test -- --reporter=verbose src/components/GameDisplay.test.jsx
```

Expected: the 8 new tests fail; the existing 6 tests still pass.

- [ ] **Step 3: Update `GameDisplay`**

Replace `src/components/GameDisplay.jsx` with:

```jsx
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
```

- [ ] **Step 4: Add CSS for new elements**

Append to `src/App.css`:

```css
/* =====================
   Top bar
   ===================== */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 24px;
}

/* Learn mode toggle */
.learn-mode-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  color: #555;
  cursor: pointer;
  user-select: none;
}

.learn-mode-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #ff6f00;
}

/* Speaker button */
.speaker-button {
  font-size: 2.4rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.15s;
  line-height: 1;
}

.speaker-button:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.07);
}

.speaker-button:disabled {
  opacity: 0.35;
  cursor: default;
}
```

- [ ] **Step 5: Run all GameDisplay tests to verify they pass**

```bash
npm run test -- --reporter=verbose src/components/GameDisplay.test.jsx
```

Expected: all 14 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/GameDisplay.jsx src/components/GameDisplay.test.jsx src/App.css
git commit -m "feat: add speaker button and Podpowiedz toggle to GameDisplay"
```

---

## Task 5 — Wire everything together in `App.jsx`

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

- [ ] **Step 1: Update `App.test.jsx` to mock `useSpeechSynthesis`**

Add this mock at the top of `src/App.test.jsx`, after the existing `vi.mock` calls:

```js
vi.mock('./hooks/useSpeechSynthesis', () => ({
  useSpeechSynthesis: vi.fn(() => ({
    speak: vi.fn(),
    isSpeaking: false,
  })),
}))
```

Also add these imports after the existing mock imports:

```js
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis'
```

Then add these new tests to the `describe('App')` block:

```jsx
  test('calls speak() on mount when learnMode is true', () => {
    localStorage.setItem('learnMode', 'true')
    const mockSpeak = vi.fn()
    useSpeechSynthesis.mockReturnValue({ speak: mockSpeak, isSpeaking: false })
    render(<App />)
    expect(mockSpeak).toHaveBeenCalledTimes(1)
    localStorage.removeItem('learnMode')
  })

  test('does not call speak() on mount when learnMode is false', () => {
    localStorage.removeItem('learnMode')
    const mockSpeak = vi.fn()
    useSpeechSynthesis.mockReturnValue({ speak: mockSpeak, isSpeaking: false })
    const mockStart = vi.fn()
    useSpeechRecognizer.mockReturnValue({ isListening: false, transcript: '', error: null, start: mockStart, stop: vi.fn() })
    render(<App />)
    expect(mockSpeak).not.toHaveBeenCalled()
    expect(mockStart).toHaveBeenCalledTimes(1)
  })

  test('renders the Podpowiedz toggle', () => {
    render(<App />)
    expect(screen.getByLabelText(/Podpowiedz/i)).toBeInTheDocument()
  })

  test('renders the speaker button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Wymów słowo/i })).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run tests to verify the new ones fail**

```bash
npm run test -- --reporter=verbose src/App.test.jsx
```

Expected: the 4 new tests fail (cannot find module `useSpeechSynthesis`); existing tests still pass.

- [ ] **Step 3: Rewrite `App.jsx`**

Replace `src/App.jsx` with:

```jsx
import { useState, useEffect, useRef } from 'react'
import { GameDisplay } from './components/GameDisplay'
import { useSpeechRecognizer } from './hooks/useSpeechRecognizer'
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis'
import { fuzzyMatch } from './utils/fuzzyMatch'
import { playSuccess, playError } from './utils/soundEffects'
import { buildDeck, getNextWord } from './utils/wordDeck'
import words from './data/words.json'
import './App.css'

export default function App() {
  const [wordState, setWordState] = useState(() => {
    const shuffled = buildDeck(words)
    return { currentWord: shuffled[0], deck: shuffled.slice(1) }
  })
  const { currentWord, deck } = wordState

  const [score, setScore] = useState(0)
  const [status, setStatus] = useState('listening')
  const [learnMode, setLearnMode] = useState(
    () => localStorage.getItem('learnMode') === 'true'
  )

  const { transcript, error, start, stop, isListening } = useSpeechRecognizer()
  const { speak, isSpeaking } = useSpeechSynthesis()
  const prevIsSpeakingRef = useRef(false)

  // On each new word: speak (learn mode) or listen directly
  useEffect(() => {
    if (learnMode) {
      speak(currentWord.polish)
    } else {
      start()
    }
  }, [currentWord]) // eslint-disable-line react-hooks/exhaustive-deps

  // After TTS finishes (isSpeaking false→true→false), start listening
  useEffect(() => {
    if (prevIsSpeakingRef.current && !isSpeaking) {
      start()
    }
    prevIsSpeakingRef.current = isSpeaking
  }, [isSpeaking]) // eslint-disable-line react-hooks/exhaustive-deps

  // React to speech recognition results
  useEffect(() => {
    if (!transcript || status !== 'listening') return

    if (fuzzyMatch(transcript, currentWord.polish)) {
      setScore((prev) => prev + 1)
      setStatus('correct')
      playSuccess()
      setTimeout(() => {
        setWordState(({ deck: d }) => {
          const { word, remainingDeck } = getNextWord(d, words)
          return { currentWord: word, deck: remainingDeck }
        })
        setStatus('listening')
      }, 1500)
    } else {
      setStatus('incorrect')
      playError()
      setTimeout(() => {
        setStatus('listening')
        start()
      }, 1500)
    }
  }, [transcript]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLearnModeChange = (value) => {
    setLearnMode(value)
    localStorage.setItem('learnMode', String(value))
  }

  const handleSpeak = () => {
    if (isListening) stop()
    speak(currentWord.polish)
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          ⚠️ Mikrofon niedostępny: {error}. Otwórz w Chrome lub Edge i zezwól na mikrofon.
        </div>
      )}
      <GameDisplay
        word={currentWord}
        score={score}
        status={status}
        learnMode={learnMode}
        onLearnModeChange={handleLearnModeChange}
        onSpeak={handleSpeak}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run all App tests to verify they pass**

```bash
npm run test -- --reporter=verbose src/App.test.jsx
```

Expected: all tests pass. Note: the existing test `'calls start() on mount to begin listening'` should still pass since `learnMode` defaults to `false` in a clean test environment (no `localStorage` entry).

- [ ] **Step 5: Run the full test suite**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: wire TTS learn mode, shuffle deck, and mic watchdog into App"
```

---

## Task 6 — Manual verification in Chrome

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open the URL printed (typically `http://localhost:5173`) in Chrome.

- [ ] **Step 2: Verify learn mode OFF (default)**

1. Page loads → an emoji appears → microphone icon shows → say the Polish word → score increments and next emoji appears.
2. Say a wrong word → shake animation plays → same emoji stays → try again.
3. Cycle through ~10 words → confirm no word repeats before all have been seen.

- [ ] **Step 3: Verify learn mode ON**

1. Check the **Podpowiedz** checkbox.
2. A word is spoken aloud in Polish.
3. After the speech ends, the mic icon appears → say the word → correct animation.
4. Next word is spoken automatically.

- [ ] **Step 4: Verify speaker button**

1. Click 🔊 → the current word is spoken again.
2. After speaking finishes, mic resumes automatically.
3. Click 🔊 while mic is active → mic stops, word speaks, mic restarts after.

- [ ] **Step 5: Verify mic watchdog**

1. Leave the page on learn mode OFF for 10+ seconds without speaking.
2. Say a word → it should still be recognised (watchdog should have silently restarted).
3. Cycle through several words (15+) → confirm mic does not go permanently silent.

- [ ] **Step 6: Final commit if any CSS tweaks were needed**

```bash
git add -p
git commit -m "fix: adjust styles after manual verification"
```
