# Ptaszek — Polish Vocabulary Game for Kids

A browser-based Polish vocabulary game designed for young children. Players are shown an emoji + word card and must either say the word aloud or tap the correct picture after hearing it spoken. Correct answers build up a paper-art landscape that grows with the score.

## Features

- **Two game modes**
  - *Powiedz słowo* — say the word aloud (speech recognition)
  - *Usłysz i dotknij* — hear the word, tap the matching card
- **Pre-generated Neural2 TTS audio** via Google Cloud — natural-sounding Polish pronunciation
- **Score-driven scenery** — new scene elements unlock every 5 points (sun, mountains, trees, house…)
- **Cut-paper aesthetic** — Eric Carle inspired, CSS-only animations
- **Category picker** — play all words or choose specific categories
- **Player profiles** — saves scores and player names in `localStorage`
- **Fuzzy match** — tolerates minor speech-recognition errors for Polish

## Tech Stack

React 19 · Vite · Vitest · Google Cloud TTS (Neural2) · Web Speech API

## Getting Started

```bash
npm install
npm run dev        # start dev server at http://localhost:5173
```

> **Chrome/Edge only** — `window.SpeechRecognition` is not available in other browsers.

## Audio Generation

Polish word audio is pre-generated using Google Cloud Neural2 TTS and committed to `public/audio/`. To regenerate (e.g. after adding new words):

```bash
# Copy the example and fill in your Google Cloud API key
cp .env.example .env

npm run generate:audio
```

The script reads all words from `src/data/words.json` and writes MP3 files to `public/audio/words/` using a filesystem-safe encoding (`%` → `_`).

## Other Commands

```bash
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint
npm run test       # Vitest in watch mode
npm run test:run   # Vitest single run
```

## Project Structure

```
src/
  components/
    Paper.jsx          # design system — palette, primitives
    Scenery.jsx        # score-driven background scene
    Celebrations.jsx   # correct-answer animations
    Transitions.jsx    # word-card transition animations
    CategoriesModal.jsx
    HearAndTouchDisplay.jsx
  hooks/
    useSpeechRecognizer.js
    useSpeechSynthesis.js
  utils/
    audioFilename.js   # wordToFilename — safe ASCII encoding
    audioPlayer.js
    fuzzyMatch.js
    wordDeck.js
  data/
    words.json         # { categoryId: [{ word, emoji }] }
    categories.json    # [{ id, label, emoji }]
  App.jsx              # all game state, three-screen layout
scripts/
  generate-audio.mjs  # Google TTS batch generator
```

## Deployment

The app is a fully static single-page app — deploy the output of `npm run build` anywhere that serves static files. Recommended: [Vercel](https://vercel.com) (auto-deploys on push, free tier).
