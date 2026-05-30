# Lang Game — Painterly UI Integration

This folder contains the files that replace the existing UI in your `lang_game` project.

## Fast path: run `apply.sh`

From inside this folder:

```bash
bash apply.sh                 # assumes ../lang_game
# or
bash apply.sh /path/to/lang_game
```

It copies every file listed below into the right place AND deletes the four stale exploration files (see "Stale files to delete"). Then:

```bash
cd ../lang_game
npm install   # if you don't already have deps
npm run dev
```

## Manual path: file map

| Copy this file… | … over this one |
|---|---|
| `index.html` | `lang_game/index.html` |
| `src/App.jsx` | `lang_game/src/App.jsx` |
| `src/App.css` | `lang_game/src/App.css` |
| `src/App.test.jsx` | `lang_game/src/App.test.jsx` *(rewritten — old test-ids removed)* |
| `src/components/GameDisplay.jsx` | `lang_game/src/components/GameDisplay.jsx` |
| `src/components/GameDisplay.test.jsx` | `lang_game/src/components/GameDisplay.test.jsx` *(rewritten)* |
| `src/components/Painterly.jsx` | **new** — `lang_game/src/components/Painterly.jsx` |
| `src/components/Scenery.jsx` | **new** — `lang_game/src/components/Scenery.jsx` |
| `src/components/Celebrations.jsx` | **new** — `lang_game/src/components/Celebrations.jsx` |
| `src/components/Transitions.jsx` | **new** — `lang_game/src/components/Transitions.jsx` |

Everything else (`hooks/`, `utils/`, `data/`, `main.jsx`, all of their tests) is **untouched** — the new UI re-uses your existing speech recognizer, synthesizer, fuzzy matcher, sound effects, and word deck logic.

## Stale files to delete

These are leftovers from the exploration phase still sitting in `src/components/`. They use a global-`React` style that won't import cleanly under Vite, and the first two will clash with the new uppercase versions on case-insensitive filesystems (macOS / Windows):

- `src/components/celebrations.jsx` *(lowercase — shadows `Celebrations.jsx`)*
- `src/components/transitions.jsx` *(lowercase — shadows `Transitions.jsx`)*
- `src/components/shared.jsx`
- `src/components/ui-shells.jsx`

`apply.sh` removes these for you.

## What changed

**Visual**
- Hand-drawn / painterly aesthetic: watercolor-edged word card, irregular blobs, no hard outlines.
- Random paper-tone background per session (peach / sage / sky / rose / ivory / buttery), persisted in `localStorage` so a child sees a stable colour while playing.
- Plant **or** world treatment beneath the word — randomly assigned per session, togglable live via the 🔁 button.
- Google Fonts: Patrick Hand, Caveat, Kalam, Gloria Hallelujah.

**Score**
- Counter still bumps. Plant grows in 6 stages (every 5 pts). World adds an element every 5 pts.
- Both share the same `score` value, so toggling shows progress immediately.

**Correct answers**
- 6 celebrations cycle randomly: confetti pop, sticker stamp, emoji multiply, praise balloons, rainbow sweep, drumroll +1.
- Polish voice praise speaks one of: *Brawo, Super, Świetnie, Tak jest, Wspaniale, Pięknie*.

**Milestones (every 5 pts)**
- Fireworks celebration overrides the random one.
- Plant levels up / world gains an element automatically (driven by score).
- Voice says *Wspaniale!*.

**Incorrect**
- Word card does a barely-noticeable nudge. Small *"Hmm… spróbuj jeszcze raz"* line. Then auto-listens again.

**Transitions**
- On every new word, one of 5 transitions plays at random: page flip, crumple toss, pencil sketch-in, springy drop, magnifier zoom.

## Notes

- The *Podpowiedz* learn-mode checkbox is rendered in `GameDisplay`, but positioned at `top:118px / right:26px` — if the corner feels crowded, restyle `.learn-mode-painterly` in `App.css`.
- All the painterly primitives live in `Painterly.jsx`. Tweak `PAPER_TONES` to add/remove colors.
- To force a specific paper tone for debugging, run `localStorage.setItem('paperTone', 'sage')` in DevTools (then reload).
- The rewritten tests target the new copy and DOM classes (`.word-area.status-correct`, `Hmm… spróbuj jeszcze raz`, etc.) — the old `status-indicator` / `image-container` test-ids are gone.

## Smoke test

After running `apply.sh` (or copying the files in manually):

```bash
cd lang_game
npm install
npm run dev
```

The first load should show a fresh paper tone, the word card with a watercolor bleed, mic prompt, and either the plant or world beneath. Tap the 🔁 button to swap treatments. `npm test` should be green.
