# Polish Language Learning Game — Design Spec

**Date:** 2026-05-21
**Status:** Approved

---

## Overview

A local web-based Polish language learning game for a 2.5-year-old child. A random image (emoji or simple SVG) is shown on screen. The player says the corresponding Polish word aloud. Speech recognition matches the spoken word to the target, awards a point, plays a success sound, and moves to the next image. Wrong answers play an error sound and prompt a retry.

**Goal of the prototype:** Validate speech recognition accuracy, user experience for a toddler, and developer experience of the chosen tech stack. Start with 5-10 words; scale to 300 later.

---

## Tech Stack

| Layer       | Technology                                | Rationale                                                       |
|-------------|-------------------------------------------|-----------------------------------------------------------------|
| Frontend    | React 18 + Vite                           | Fast dev setup, component model scales to 300 words             |
| Speech      | Web Speech API (v1), Vosk-ready (v2)      | Zero-setup prototype; abstracted for offline swap later          |
| Styling     | CSS Modules                               | Scoped, simple, no extra tooling                                |
| Audio       | Web Audio API                             | Programmatic beeps — no asset files needed                      |
| Data        | `src/data/words.json`                     | Flat JSON, trivially expandable                                 |

---

## Architecture

### Abstraction Layer for Speech

The key architectural decision: the speech recognizer is a custom React hook (`useSpeechRecognizer`) that returns a stable interface:

```
{ isListening, transcript, start, stop, error }
```

The internals use Web Speech API now. To migrate to Vosk later, only the hook internals change — no component code changes.

### Game Flow

```
1. App mounts → loads words from JSON
2. Pick a random word (avoid immediate repeats)
3. Display the word's image/emoji to the player
4. Auto-start listening (with visual "listening..." indicator)
5. Player speaks the Polish word
6. Speech recognizer returns transcript
7. fuzzyMatch(transcript, targetWord) → true/false
8. If match:
   - Play success sound (Web Audio API)
   - Increment score
   - Show brief visual flash (CSS animation, ~1 second)
   - After 1.5s: go to step 2
9. If no match:
   - Play error sound
   - Restart listening (allow retry on same word)
```

---

## Components

### `App.jsx`
Top-level component. Manages:
- `currentWord` — the active word object from words.json
- `score` — total correct answers this session
- `gameStatus` — `'listening' | 'correct' | 'incorrect'`

Orchestrates the flow; passes state down to `GameDisplay`.

### `GameDisplay.jsx`
Pure display component. Receives:
- `word` — current word object `{polish, english, image}`
- `score` — current score
- `status` — `'listening' | 'correct' | 'incorrect'`

Renders the image, score, and visual status indicator. No logic.

### `useSpeechRecognizer.js` (custom hook)
Wraps Web Speech API. Returns `{ isListening, transcript, start, stop, error }`.
Language set to `pl-PL`. This is the **only** file that changes when migrating to Vosk.

### `fuzzyMatch.js` (utility)
Compares recognized transcript to target Polish word. Strategy:
- Normalize both strings (lowercase, trim)
- Check if target word appears anywhere in transcript
- Optional: simple character-level similarity score to handle slight mispronunciation

### `soundEffects.js` (utility)
Generates short tones using Web Audio API:
- `playSuccess()` — rising two-tone beep
- `playError()` — low descending beep

---

## Data Format

```json
[
  { "id": 1, "polish": "kwadrat",   "english": "square",   "image": "🟥" },
  { "id": 2, "polish": "koło",      "english": "circle",   "image": "🔵" },
  { "id": 3, "polish": "trójkąt",   "english": "triangle", "image": "🔺" },
  { "id": 4, "polish": "pies",      "english": "dog",      "image": "🐶" },
  { "id": 5, "polish": "kot",       "english": "cat",      "image": "🐱" },
  { "id": 6, "polish": "jabłko",    "english": "apple",    "image": "🍎" },
  { "id": 7, "polish": "dom",       "english": "house",    "image": "🏠" }
]
```

Expanding to 300 words: add entries to this file. Categories, difficulty levels, and image assets can be added as new fields later without breaking existing entries.

---

## File Structure

```
lang-game/
├── public/
├── src/
│   ├── components/
│   │   ├── App.jsx
│   │   └── GameDisplay.jsx
│   ├── hooks/
│   │   └── useSpeechRecognizer.js
│   ├── data/
│   │   └── words.json
│   ├── utils/
│   │   ├── fuzzyMatch.js
│   │   └── soundEffects.js
│   ├── App.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## Prototype Validation Goals

| Goal                    | How to evaluate                                          |
|-------------------------|----------------------------------------------------------|
| Speech accuracy         | Try 3-5 words yourself; check if `pl-PL` recognizes them|
| UX for toddler          | Watch your daughter use it — does she understand the flow?|
| Developer experience    | How easy is it to add a new word or change an image?     |

---

## Deferred to Later

- Offline speech recognition (Vosk) — migrate `useSpeechRecognizer.js` only
- Celebratory animations (confetti, dancing characters)
- iOS app (React Native or Capacitor wrapper)
- Categories and difficulty levels
- Word audio pronunciation playback
- Progress persistence (localStorage or simple backend)
