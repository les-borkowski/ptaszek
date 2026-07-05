import { PaperLayer, PALETTE } from './Paper'

/* =====================================================
   Scenery.jsx — cut-paper background scene that builds up.
   Stages (driven by score):
     0:   kraft + sun
     5:   + back mountains
     10:  + mid hills
     15:  + front grass
     20:  + left tree
     25:  + cloud
     30:  + right tree
     35:  + house
     40:  + birds
   ===================================================== */

const STAGES = [
  { at: 0,  key: 'sun' },
  { at: 5,  key: 'mountains' },
  { at: 10, key: 'hills' },
  { at: 15, key: 'grass' },
  { at: 20, key: 'tree1' },
  { at: 25, key: 'cloud' },
  { at: 30, key: 'tree2' },
  { at: 35, key: 'house' },
  { at: 40, key: 'birds' },
]

export function stageReached(score, key) {
  const s = STAGES.find((x) => x.key === key)
  return s ? score >= s.at : false
}

/* ---------- Big paper sun in the corner ---------- */
function PaperSun() {
  return (
    <div style={{
      position: 'absolute', top: -40, right: -40,
      width: 160, height: 160, borderRadius: '50%',
      background: PALETTE.mustard,
      filter: 'drop-shadow(6px 8px 0 rgba(42,38,32,0.18))',
      animation: 'paper-pop 0.5s ease',
    }} />
  )
}

/* ---------- Cloud — soft white blob ---------- */
function PaperCloud({ x = 16, y = 60, w = 110 }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: w, height: w * 0.5,
      animation: 'paper-pop 0.5s ease',
    }}>
      <svg viewBox="0 0 120 60" width="100%" height="100%"
           style={{ overflow: 'visible' }}>
        <g filter="url(#paper-shadow)">
          <path d="M 20 36 Q 8 30 14 20 Q 20 8 36 14 Q 44 4 60 12 Q 72 4 86 14 Q 102 12 104 28 Q 116 32 108 44 Q 100 54 86 50 Q 70 56 56 50 Q 40 56 28 48 Q 14 48 20 36 Z"
                fill="#fff" />
        </g>
      </svg>
    </div>
  )
}

/* ---------- Tree — coral trunk + mint blob ---------- */
function PaperTree({ x, y, scale = 1, mirror = false }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(-50%, -100%) scale(${scale}) ${mirror ? 'scaleX(-1)' : ''}`,
      animation: 'paper-pop 0.5s ease',
    }}>
      <svg viewBox="0 0 120 160" width="120" height="160"
           style={{ overflow: 'visible' }}>
        <g filter="url(#paper-shadow)">
          {/* trunk */}
          <path d="M 52 160 L 52 90 Q 50 78 60 70 Q 70 78 68 90 L 68 160 Z"
                fill="#A55F35" />
          {/* foliage layer 1 (back) */}
          <path d="M 22 70 Q 8 56 22 36 Q 18 14 42 14 Q 50 0 64 8 Q 80 -2 92 12 Q 112 10 110 32 Q 122 50 102 60 Q 96 76 78 70 Q 60 80 44 70 Q 26 78 22 70 Z"
                fill={PALETTE.navy} opacity="0.85" />
          {/* foliage layer 2 (front) — slightly smaller, mint */}
          <path d="M 32 64 Q 22 50 36 36 Q 30 18 50 22 Q 56 12 68 18 Q 82 12 88 24 Q 104 26 100 42 Q 108 56 92 60 Q 84 70 70 64 Q 56 70 44 64 Q 32 68 32 64 Z"
                fill={PALETTE.mint} transform="translate(2 2)" />
        </g>
      </svg>
    </div>
  )
}

/* ---------- House — wee paper cottage ---------- */
function PaperHouse({ x = '50%', y = 200, scale = 1 }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `translate(-50%, -100%) scale(${scale})`,
      animation: 'paper-pop 0.5s ease',
      zIndex: 2,
    }}>
      <svg viewBox="0 0 140 130" width="140" height="130"
           style={{ overflow: 'visible' }}>
        <g filter="url(#paper-shadow)">
          {/* body */}
          <path d="M 22 60 L 22 122 L 118 122 L 118 60 Z" fill={PALETTE.cream} />
          {/* roof */}
          <path d="M 10 64 L 70 16 L 130 64 Z" fill={PALETTE.coral} />
          {/* door */}
          <path d="M 60 122 L 60 88 Q 60 80 70 80 Q 80 80 80 88 L 80 122 Z" fill={PALETTE.navy} />
          {/* doorknob */}
          <circle cx="75" cy="103" r="2.4" fill={PALETTE.mustard} />
          {/* window */}
          <rect x="30" y="78" width="20" height="20" rx="2" fill={PALETTE.sky} />
          <rect x="90" y="78" width="20" height="20" rx="2" fill={PALETTE.sky} />
          {/* window cross */}
          <path d="M 40 78 L 40 98 M 30 88 L 50 88" stroke={PALETTE.cream} strokeWidth="2" />
          <path d="M 100 78 L 100 98 M 90 88 L 110 88" stroke={PALETTE.cream} strokeWidth="2" />
          {/* chimney */}
          <rect x="92" y="22" width="14" height="22" fill={PALETTE.mustard} />
        </g>
      </svg>
    </div>
  )
}

/* ---------- Birds — V-shaped flying paper birds ---------- */
function PaperBirds() {
  return (
    <div style={{
      position: 'absolute', top: 90, left: '38%',
      animation: 'paper-pop 0.5s ease, paper-drift 6s ease-in-out infinite',
    }}>
      <svg viewBox="0 0 100 40" width="100" height="40">
        <g stroke={PALETTE.ink} strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M 8 18 Q 16 8 24 18" />
          <path d="M 38 22 Q 46 12 54 22" />
          <path d="M 68 16 Q 76 6 84 16" />
        </g>
      </svg>
    </div>
  )
}

/* ---------- The composed scene ---------- */
export function Scene({ score = 0, w = '100%', h = '100%' }) {
  return (
    <div style={{
      width: w, height: h,
      position: 'absolute', inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {/* SVG defs (shared filter) */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id="paper-shadow" x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="3" dy="5" stdDeviation="0"
                          floodColor="#2A2620" floodOpacity="0.22" />
          </filter>
        </defs>
      </svg>

      {stageReached(score, 'sun')   && <PaperSun />}
      {stageReached(score, 'cloud') && <PaperCloud x={26} y={64} w={120} />}

      {/* Layered mountains/hills/grass — composed in one SVG so they share
          drop-shadow geometry. Only render layers that are unlocked. */}
      <svg viewBox="0 0 480 240" preserveAspectRatio="none"
           width="100%" height="44%"
           style={{ position: 'absolute', bottom: 0, left: 0, display: 'block' }}>
        <defs>
          <filter id="scene-shadow" x="-5%" y="-5%" width="110%" height="115%">
            <feDropShadow dx="0" dy="-4" stdDeviation="0"
                          floodColor="#2A2620" floodOpacity="0.18" />
          </filter>
        </defs>
        {stageReached(score, 'mountains') && (
          <path d="M0 130 L100 70 L180 120 L280 50 L380 110 L480 80 L480 240 L0 240 Z"
                fill={PALETTE.navy} opacity="0.85" filter="url(#scene-shadow)">
            <animate attributeName="opacity" from="0" to="0.85" dur="0.5s" />
          </path>
        )}
        {stageReached(score, 'hills') && (
          <path d="M0 170 Q120 130 240 160 Q360 190 480 150 L480 240 L0 240 Z"
                fill={PALETTE.mint} filter="url(#scene-shadow)">
            <animate attributeName="opacity" from="0" to="1" dur="0.5s" />
          </path>
        )}
        {stageReached(score, 'grass') && (
          <path d="M0 200 Q120 180 240 200 Q360 220 480 195 L480 240 L0 240 Z"
                fill={PALETTE.coral} opacity="0.9">
            <animate attributeName="opacity" from="0" to="0.9" dur="0.5s" />
          </path>
        )}
      </svg>

      {/* Foreground props — positioned over the SVG */}
      {stageReached(score, 'tree1') && <PaperTree x="14%" y="86%" scale={0.85} />}
      {stageReached(score, 'tree2') && <PaperTree x="86%" y="84%" scale={0.95} mirror />}
      {stageReached(score, 'house') && <PaperHouse x="50%" y="86%" scale={1} />}
      {stageReached(score, 'birds') && <PaperBirds />}
    </div>
  )
}
