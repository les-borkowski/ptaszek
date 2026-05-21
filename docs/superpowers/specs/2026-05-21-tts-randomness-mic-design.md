# Design: TTS Learn Mode, Shuffle Deck, Mic Watchdog

**Date:** 2026-05-21  
**Status:** Approved

## Summary

Three improvements to the Polish language learning game:

1. **TTS learn mode** — app speaks the Polish word before listening, with a replay button.
2. **Shuffle deck** — replace single-exclusion randomness with a full Fisher-Yates deck so every word is seen before any repeats.
3. **Mic watchdog** — silently restart Chrome's Web Speech API if it goes silent (no result after 8 s).

---

## 1. Architecture & Data Flow

### Files changed

| File | Change |
|---|---|
| `src/hooks/useSpeechSynthesis.js` | **New.** Wraps `window.speechSynthesis`. |
| `src/hooks/useSpeechRecognizer.js` | Add watchdog timer. Suppress `aborted` errors. |
| `src/App.jsx` | Orchestrate TTS→listen flow. Shuffle deck state. Learn mode toggle with localStorage. |
| `src/components/GameDisplay.jsx` | Speaker button. Learn mode toggle UI. |

### Word flow — learn mode ON

```
word changes
  → speak(word.polish)
  → TTS onend → start() recognition
  → onresult → fuzzyMatch
      correct   → playSuccess → next word from deck
      incorrect → playError  → re-listen (same word)
```

### Word flow — learn mode OFF (original)

```
word changes → start() recognition immediately
```

---

## 2. Shuffle Deck

Replaces `getRandomWord()` in `App.jsx`.

```
state: { deck: Word[], currentWord: Word }

getNextWord(deck, allWords):
  if deck is empty → Fisher-Yates shuffle of allWords → [first, rest]
  else             → [deck[0], deck.slice(1)]
```

- Deck is pre-shuffled on mount.
- Each correct answer pops the next word.
- No word repeats until all 30 have been seen.
- On exhaustion, immediately reshuffles — no pause in gameplay.

---

## 3. Learn Mode Toggle

- `useState` in `App.jsx`, persisted to `localStorage` as `learnMode`.
- Takes effect on the next word; current word finishes its cycle normally.
- UI: checkbox/switch labelled **"Podpowiedz"** in the top bar beside the score.
- `GameDisplay` receives: `learnMode`, `onLearnModeChange`, `onSpeak`, `isSpeaking`, `isListening`.

---

## 4. `useSpeechSynthesis` Hook

```js
const { speak, isSpeaking } = useSpeechSynthesis()
```

- `speak(text, lang = 'pl-PL')` — cancels any in-progress speech, then speaks.
- `isSpeaking` — true while TTS is active. Used to disable speaker button and gate `start()`.
- App reacts to `isSpeaking` going `false` (via `useEffect`) to trigger `start()`.

### Speaker button behaviour

- Always visible and always enabled.
- On tap while TTS playing: `speak()` calls `speechSynthesis.cancel()` internally, then replays the word. After the new utterance ends, listening restarts.
- On tap while `isListening`: stops recognition, speaks, restarts recognition after TTS ends.
- On tap while idle: speaks, then restarts recognition after TTS ends.

---

## 5. `useSpeechRecognizer` Changes

### Watchdog timer

```
start() called
  → set 8 s timer ref
  → onresult fires → clear timer  (normal path)
  → timer expires  → stop() + start() silently
  → onend fires    → clear timer
```

- Watchdog only runs while `isListening` is true.
- Safe during TTS handoff: `isListening` is false while speaking.

### Error handling

| Error | Behaviour |
|---|---|
| `aborted` | Silently ignored — fires normally during TTS→mic handoff |
| All others | Surface via `setError` → error banner shown |

---

## 6. Edge Cases

| Scenario | Behaviour |
|---|---|
| User taps speaker while TTS playing | Cancels current speech, replays from start |
| User taps speaker while mic listening | Stops recognition → speaks → restarts after TTS ends |
| Tab goes to background | Browser pauses naturally; watchdog fires on return, silently restarts |
| Word deck exhausted | Immediate reshuffle, no pause |
| Learn mode toggled mid-word | Takes effect on next word |

---

## Out of Scope

- Offline TTS / pre-recorded audio (future if voice quality is insufficient)
- Category filtering (separate feature)
- Non-Chrome browser support beyond current state
