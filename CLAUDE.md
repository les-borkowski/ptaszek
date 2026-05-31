# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Ptaszek** ("Little Bird") — a Polish vocabulary game for young children. Players are shown an emoji+word card and must either say the word aloud ("Powiedz słowo" mode) or tap the correct picture after hearing it spoken ("Usłysz i dotknij" mode). Correct answers advance a score-driven scenery that builds up a paper landscape.

## Commands

```bash
npm run dev        # start Vite dev server
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint
npm run test       # Vitest in watch mode
npm run test:run   # Vitest single run (CI)
```

Run a single test file:
```bash
npx vitest run src/utils/fuzzyMatch.test.js
```

**Browser requirement:** Speech recognition (`window.SpeechRecognition`) only works in Chrome/Edge. Open the dev server in one of those browsers when testing the full game flow.

## Architecture

### State machine in `App.jsx`
All game state lives in `App.jsx`. The three screens (`title`, `game`, `scores`) are rendered conditionally. The game loop is driven by three `useEffect` chains:
1. **New word** → speak it (learn mode) *or* start listening immediately.
2. **TTS finishes** (`isSpeaking` true→false) → start listening.
3. **Transcript changes** → run `fuzzyMatch`; on correct: celebrate + advance deck; on incorrect: flash error + restart listener.

`mode === 'hear'` follows a separate path: `HearAndTouchDisplay` shows four word options, the word is spoken aloud, and tapping the correct card triggers the same score/celebration flow.

### Word data
`src/data/words.json` — object keyed by category id (`shapes`, `colours`, `domestic_animals`), each value an array of `{ word, emoji }`.  
`src/data/categories.json` — array of `{ id, label, emoji }` for the UI picker.

`src/utils/wordDeck.js` — `buildDeck` shuffles a flat array of all (or selected-category) words; `getNextWord` pops from that deck, rebuilding when exhausted.

### Design system (`src/components/Paper.jsx`)
Everything visual uses a **cut-paper / construction-paper aesthetic** (Eric Carle inspired). `Paper.jsx` exports the palette, primitive components (`PaperLayer`, `WordCard`, `PaperChain`, `SpeechBubble`, `MicButton`, `PaperBadge`, `PaperStar`, `ConfettiScrap`, `ScoreBump`), and a deterministic PRNG (`mulberry32`) used to generate stable random shapes per seed.

The two Google Fonts loaded globally: **Nunito** (body/display, `--f-display`) and **Patrick Hand**.

### Score-driven scene (`src/components/Scenery.jsx`)
New scene elements unlock at every 5-point milestone (sun → mountains → hills → grass → trees → cloud → house → birds). `nextStageAt(score)` is used in the footer to hint at the next unlock.

### Celebrations (`src/components/Celebrations.jsx`)
Six celebration types (`confetti`, `stamp`, `multiply`, `balloons`, `rainbow`, `plusone`) play on correct answers; `fireworks` is reserved for every 5th-point milestone. All are CSS-animation driven; `playKey` (a timestamp) forces re-mount.

### Transitions (`src/components/Transitions.jsx`)
`WordTransition` picks a random CSS animation class (`slide`, `flip`, `drop`, `tear`, `pop`) each time the word changes, giving the card a cut-paper feel.

### Speech hooks
- `useSpeechRecognizer` — wraps `window.SpeechRecognition`, language `pl-PL`, with an 8-second watchdog that restarts the recognizer if it silently stalls.
- `useSpeechSynthesis` — wraps `window.speechSynthesis`, exposes `speak(text, lang?)` and `isSpeaking`.
- `speakPraise` (in `Paper.jsx`) — fire-and-forget synthesis used for praise phrases (higher pitch/rate than the main hook).

### Persistence (`localStorage`)
| Key | Content |
|-----|---------|
| `ptaszek_scores` | JSON array of `{ player, score, mode, date }`, capped at 50 |
| `ptaszek_players` | JSON array of player name strings, capped at 8 |
| `ptaszek_last_player` | most recent player name string |
| `ptaszek_categories` | JSON array of selected category ids (null = all) |
| `learnMode` | `"true"` / `"false"` |

### Testing notes
Tests mock `useSpeechRecognizer`, `useSpeechSynthesis`, and `soundEffects` (Web APIs unavailable in jsdom). `src/test/setup.js` replaces `localStorage` with an in-memory mock to avoid Node 22's native webstorage leaking into jsdom.
