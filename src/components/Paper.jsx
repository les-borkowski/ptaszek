import { useMemo, useEffect, useRef, useState } from 'react'
import { wordToFilename } from '../utils/audioFilename'

/* =====================================================
   Paper.jsx — cut-paper primitives.
   Style C: layered construction paper, hard offset
   drop-shadows (no blur), slight rotations.
   Eric Carle / Wee Society / pop-up storybook.
   ===================================================== */

export const PALETTE = {
  kraft:   '#E8D7B2',
  kraft2:  '#D9C190',
  ink:     '#2A2620',
  cream:   '#F4EFE6',
  coral:   '#E07A5F',
  mint:    '#9DCDA5',
  navy:    '#2F3E5C',
  mustard: '#D9A93E',
  rose:    '#E8A7B4',
  sky:     '#BFD9E8',
}

export const PRAISE_COLORS = [
  PALETTE.coral, PALETTE.mustard, PALETTE.mint, PALETTE.navy, PALETTE.rose,
]

/* ---------- Polish voice praise ---------- */
export function speakPraise(text) {
  const audio = new Audio(`/audio/praise/${wordToFilename(text)}.mp3`)
  audio.play().catch(() => {})
}

/* ---------- Deterministic PRNG ---------- */
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ---------- PaperLayer — flat fill + hard offset shadow ----------
   Use as a building block for anything that should read as a piece
   of construction paper. */
export function PaperLayer({
  children,
  color = PALETTE.cream,
  rotate = 0,
  shadow = 6,
  shadowColor = 'rgba(42,38,32,0.20)',
  style,
  className,
  ...rest
}) {
  return (
    <div
      className={className}
      style={{
        background: color,
        filter: `drop-shadow(${Math.round(shadow * 0.6)}px ${shadow}px 0 ${shadowColor})`,
        transform: `rotate(${rotate}deg)`,
        position: 'relative',
        ...style,
      }}
      {...rest}
    >{children}</div>
  )
}

/* ---------- Torn-paper radii — irregular per-corner ----------
   `base`/`spread` control how rounded the result reads: low values give a
   squared-off card with just a hint of torn-paper unevenness, high values
   give the rounder blob look. */
function tornRadii(seed, base = 38, spread = 10) {
  const r = mulberry32(seed)
  const a = base + r() * spread
  const b = base + r() * spread
  const c = base + r() * spread
  const d = base + r() * spread
  const e = base + r() * spread
  const f = base + r() * spread
  const g = base + r() * spread
  const h = base + r() * spread
  return `${a}% ${b}% ${c}% ${d}% / ${e}% ${f}% ${g}% ${h}%`
}

/* ---------- WordImage — illustrated word art, falls back to emoji ----------
   `fill`: stretch to 100% of the parent and crop to cover it (edge-to-edge
   tile), instead of sizing to `size` and letterboxing inside it. */
export function WordImage({ word, size, fill = false, style }) {
  const [broken, setBroken] = useState(false)
  // Reset on word change — WordCard doesn't always remount between words
  // (see WordTransition), so a stale "broken" flag could otherwise stick.
  useEffect(() => { setBroken(false) }, [word.word])

  if (broken) {
    return <span style={{ fontSize: size, lineHeight: 1, ...style }}>{word.emoji}</span>
  }
  const dims = fill ? { width: '100%', height: '100%' } : { width: size, height: size }
  return (
    <img
      src={`/images/words/${wordToFilename(word.word)}.png`}
      alt={word.word}
      onError={() => setBroken(true)}
      style={{ ...dims, objectFit: fill ? 'cover' : 'contain', ...style }}
    />
  )
}

/* ---------- WordCard — layered paper picture + a separate word tag ---------- */
export function WordCard({ word, size = 220, seed = 7 }) {
  const radBack  = useMemo(() => tornRadii(seed, 10, 6),      [seed])
  const radFront = useMemo(() => tornRadii(seed + 1, 10, 6),  [seed])
  const radLabel = useMemo(() => tornRadii(seed + 2, 14, 8),  [seed])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      {/* Picture card */}
      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Back layer — bigger jagged piece */}
        <PaperLayer color={PALETTE.mustard} rotate={-4} shadow={10} style={{
          position: 'absolute', inset: '-8px', borderRadius: radBack,
        }}>
          <div style={{ width: '100%', height: '100%' }} />
        </PaperLayer>
        {/* Front layer — filled edge-to-edge by the picture */}
        <PaperLayer color={PALETTE.cream} rotate={2} shadow={6} style={{
          position: 'absolute', inset: 14, borderRadius: radFront,
          overflow: 'hidden',
        }}>
          <WordImage word={word} fill />
        </PaperLayer>
      </div>

      {/* Word label — separate paper clip below the picture */}
      <PaperLayer color={PALETTE.cream} rotate={-2} shadow={5} style={{
        borderRadius: radLabel,
        padding: '8px 20px',
        maxWidth: size + 40,
      }}>
        <div style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 700,
          fontSize: size * 0.09,
          color: PALETTE.ink,
          letterSpacing: 0.5,
          textAlign: 'center',
        }}>{word.word}</div>
      </PaperLayer>
    </div>
  )
}

/* ---------- PaperChain — score progress as rotating paper loops ----------
   Pattern: 5 loops per ring. Filled = `score % 5`, but if score>0 and
   divisible by 5 we show all 5 filled.
   Above the chain, a small "rings completed" badge ticks up. */
const CHAIN_COLORS = [PALETTE.coral, PALETTE.mustard, PALETTE.mint, PALETTE.rose, PALETTE.navy]
const CHAIN_ROTS   = [-4, 3, -2, 4, -3]

export function PaperChain({ score = 0, size = 'md' }) {
  const ringsDone = Math.floor(score / 5)
  const inRing = score === 0 ? 0 : (score % 5 === 0 ? 5 : score % 5)

  const s = size === 'lg'
    ? { loopW: 28, loopH: 38, overlap: -8, fontProgress: 12, fontRings: 14 }
    : { loopW: 22, loopH: 30, overlap: -6, fontProgress: 11, fontRings: 12 }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        fontFamily: 'var(--f-display)',
      }}>
        <div style={{
          fontSize: s.fontProgress, fontWeight: 600, color: PALETTE.ink,
          opacity: 0.6, letterSpacing: 1.5,
        }}>POSTĘP</div>
        {ringsDone > 0 && (
          <div style={{
            fontSize: s.fontRings, fontWeight: 700, color: PALETTE.ink,
            background: PALETTE.cream,
            padding: '2px 8px',
            borderRadius: 10,
            filter: 'drop-shadow(2px 3px 0 rgba(42,38,32,0.18))',
          }}>×{ringsDone}</div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {[0,1,2,3,4].map((i) => {
          const on = i < inRing
          return (
            <div key={i} style={{
              width: s.loopW, height: s.loopH,
              marginLeft: i === 0 ? 0 : s.overlap,
              borderRadius: 12,
              background: on ? CHAIN_COLORS[i] : 'transparent',
              border: on ? 'none' : `2px dashed ${PALETTE.ink}44`,
              filter: on ? `drop-shadow(2px 3px 0 rgba(42,38,32,0.22))` : 'none',
              transform: `rotate(${CHAIN_ROTS[i]}deg)`,
              transition: 'background 0.25s ease',
            }} />
          )
        })}
      </div>
    </div>
  )
}

/* ---------- SpeechBubble — small white paper prompt ---------- */
export function SpeechBubble({ children, style }) {
  return (
    <div style={{
      background: '#fff',
      padding: '8px 14px',
      borderRadius: 14,
      fontFamily: 'var(--f-display)',
      fontWeight: 600,
      fontSize: 14,
      color: PALETTE.ink,
      filter: 'drop-shadow(3px 4px 0 rgba(42,38,32,0.18))',
      position: 'relative',
      ...style,
    }}>
      {children}
      {/* tiny tail */}
      <div style={{
        position: 'absolute',
        bottom: -6,
        left: 18,
        width: 12,
        height: 12,
        background: '#fff',
        borderRadius: 2,
        transform: 'rotate(45deg)',
      }} />
    </div>
  )
}

/* ---------- MicButton — coral paper circle ---------- */
export function MicButton({ onClick, label = '🎤', ariaLabel = 'Wymów słowo', color = PALETTE.coral, disabled = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="paper-mic"
      disabled={disabled}
      style={{
        background: color,
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        width: 64,
        height: 64,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 26,
        color: '#fff',
        filter: 'drop-shadow(4px 6px 0 rgba(42,38,32,0.22))',
        transform: 'rotate(-3deg)',
        transition: 'transform 0.1s ease, filter 0.1s ease',
        opacity: disabled ? 0.4 : 1,
      }}
    >{label}</button>
  )
}

/* ---------- PaperBadge — small floating tag ---------- */
export function PaperBadge({ children, color = PALETTE.mint, rotate = -3, size = 14 }) {
  return (
    <PaperLayer color={color} rotate={rotate} shadow={4} style={{
      padding: '4px 10px',
      borderRadius: 10,
      fontFamily: 'var(--f-display)',
      fontWeight: 700,
      fontSize: size,
      color: PALETTE.ink,
      display: 'inline-block',
    }}>{children}</PaperLayer>
  )
}

/* ---------- ScoreBump — number that pops when it changes ---------- */
export function ScoreBump({ value, size = 32, color = PALETTE.ink }) {
  const prev = useRef(value)
  const [k, setK] = useState(0)
  useEffect(() => {
    if (prev.current !== value) {
      setK((x) => x + 1)
      prev.current = value
    }
  }, [value])
  return (
    <span key={k} style={{
      display: 'inline-block',
      fontFamily: 'var(--f-display)',
      fontSize: size,
      fontWeight: 700,
      color,
      animation: 'paper-bounce 0.5s ease',
      lineHeight: 1,
    }}>{value}</span>
  )
}

/* ---------- Painted star (paper, no outline) — for celebrations ---------- */
export function PaperStar({ size = 90, fill = PALETTE.mustard, rotate = -8 }) {
  const path = 'M 60 8 L 75 46 L 116 49 L 84 75 L 95 116 L 60 92 L 25 116 L 36 75 L 4 49 L 45 46 Z'
  return (
    <svg viewBox="0 0 120 120" width={size} height={size}
         style={{
           overflow: 'visible',
           filter: `drop-shadow(4px 6px 0 rgba(42,38,32,0.22))`,
           transform: `rotate(${rotate}deg)`,
         }}>
      <path d={path} fill={fill} />
      <path d={path} fill="#fff" opacity="0.18"
            style={{ clipPath: 'inset(0 50% 0 0)' }} />
    </svg>
  )
}

/* ---------- Confetti scrap — small paper rectangle/circle/triangle ---------- */
export function ConfettiScrap({ shape = 'rect', color = PALETTE.coral, size = 12 }) {
  if (shape === 'circle') {
    return <span style={{
      width: size, height: size, borderRadius: '50%',
      background: color,
      filter: 'drop-shadow(1px 2px 0 rgba(42,38,32,0.22))',
      display: 'inline-block',
    }} />
  }
  if (shape === 'tri') {
    return <span style={{
      width: size, height: size,
      background: color,
      clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
      filter: 'drop-shadow(1px 2px 0 rgba(42,38,32,0.22))',
      display: 'inline-block',
    }} />
  }
  return <span style={{
    width: size, height: size * 1.4,
    background: color,
    borderRadius: 2,
    filter: 'drop-shadow(1px 2px 0 rgba(42,38,32,0.22))',
    display: 'inline-block',
  }} />
}
