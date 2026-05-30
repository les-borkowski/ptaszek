# Lang Game — Cut-Paper UI (Style C)

Replacement UI for your `lang_game` project in the layered construction-paper / Eric Carle style.

## Fast path: run `apply.sh`

From inside this folder:

```bash
bash apply.sh                 # assumes ../lang_game
# or
bash apply.sh /path/to/lang_game
```

It copies every file listed below into the right place AND deletes anything left over from previous iterations that would shadow or conflict. Then:

```bash
cd ../lang_game
npm install   # if needed
npm run dev
```

## File map

| Copy this file… | … over this one |
|---|---|
| `index.html` | `lang_game/index.html` *(updates title + Fredoka/Patrick Hand fonts)* |
| `src/App.jsx` | `lang_game/src/App.jsx` |
| `src/App.css` | `lang_game/src/App.css` |
| `src/App.test.jsx` | `lang_game/src/App.test.jsx` |
| `src/components/GameDisplay.jsx` | `lang_game/src/components/GameDisplay.jsx` |
| `src/components/GameDisplay.test.jsx` | `lang_game/src/components/GameDisplay.test.jsx` |
| `src/components/Paper.jsx` | **new** — `lang_game/src/components/Paper.jsx` |
| `src/components/Scenery.jsx` | **new** — `lang_game/src/components/Scenery.jsx` (overwrites the previous painterly one) |
| `src/components/Celebrations.jsx` | **new** — `lang_game/src/components/Celebrations.jsx` |
| `src/components/Transitions.jsx` | **new** — `lang_game/src/components/Transitions.jsx` |

Everything else (`hooks/`, `utils/`, `data/`, `main.jsx` + tests for those) stays untouched.

## Files removed by `apply.sh`

These are leftovers from earlier iterations. Lowercase ones shadow the new uppercase versions on macOS/Windows:

- `src/components/celebrations.jsx`
- `src/components/transitions.jsx`
- `src/components/shared.jsx`
- `src/components/ui-shells.jsx`
- `src/components/Painterly.jsx` *(the previous painterly system — not used by Style C)*

## What you get

**Look — Style C (cut-paper pop-up)**
- Kraft paper background with subtle paper-grid texture
- Big paper sun cut-out top-right
- Layered Eric Carle–style mountain / hill / grass silhouettes (navy → mint → coral)
- Word card = two stacked torn-paper shapes (mustard back, cream front), slight rotations, hard offset drop-shadows
- White speech-bubble prompt ("Powiedz słowo!") — changes copy/color by status
- Coral paper mic button (with tilt, hover lift, press)
- Palette: kraft, ink, cream, coral, mint, navy, mustard, rose, sky

**Progress — paper chain**
- Top-left: row of 5 colored paper loops (coral, mustard, mint, rose, navy)
- Each correct word fills the next loop
- Every 5 → all loops light up, `×N` ring counter appears next to POSTĘP
- The scene also unlocks elements as the score grows:
  - 0   sun
  - 5   back mountains
  - 10  mid hills
  - 15  front grass
  - 20  left tree
  - 25  cloud
  - 30  right tree
  - 35  house
  - 40  birds
- A small "Następny etap za N" hint badge sits in the bottom-left

**Correct answers**
- 6 paper-themed celebrations cycle randomly: confetti scraps, star stamp, emoji multiply, praise balloons, paper-arc rainbow, +1 drumroll
- Polish voice praise speaks one of: *Brawo, Super, Świetnie, Tak jest, Wspaniale, Pięknie*

**Milestones (every 5 pts)**
- Paper fireworks burst (overrides the random celebration)
- Voice says *Wspaniale!*
- The next scene element unlocks automatically

**Incorrect**
- Word card nudges left/right
- Bubble turns rose with "Spróbuj jeszcze raz…"
- Re-listens after 1.5s

**Word-to-word transitions (random per word)**
- slide (slides in tilted from off-screen)
- flip (3D Y-axis flip)
- drop (drops + bounces)
- tear (clip-path reveal)
- pop (scale-in)

## Notes

- Fonts: `Fredoka` 500/600/700 + `Patrick Hand`. Imported from Google Fonts in `index.html`.
- All paper primitives live in `Paper.jsx` — tweak `PALETTE` to recolor everything in one place.
- The scene is data-driven in `Scenery.jsx`'s `STAGES` array — add more `{at, key}` entries to extend.
- Tests target the new copy ("POSTĘP", "Powiedz słowo!", "Wymów słowo") and the `.word-area.status-*` class — old test-ids are gone.

## Smoke test

```bash
cd lang_game
npm install
npm run dev
```

You should see the kraft screen with the sun, an apple/cat/whatever word card on the cream tag, "Powiedz słowo!" bubble, mic in the corner, and the chain at zero. Say the word → chain fills + a celebration plays. Hit 5 → fireworks + the back mountains appear.
