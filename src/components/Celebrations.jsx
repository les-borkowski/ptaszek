import { useMemo } from 'react'
import { WordCard, PaperLayer, PaperStar, ConfettiScrap, PALETTE, PRAISE_COLORS, mulberry32 } from './Paper'

/* =====================================================
   Celebrations.jsx — 6 paper-themed celebrations + fireworks.
   Each accepts {kind, word, playKey} via <Celebration/>.
   ===================================================== */

function PraiseTag({ text, color = PALETTE.coral, size = 38, rotate = -4, style }) {
  return (
    <PaperLayer color={color} rotate={rotate} shadow={6} style={{
      padding: '8px 18px',
      borderRadius: 14,
      fontFamily: 'var(--f-display)',
      fontWeight: 700,
      fontSize: size,
      color: '#fff',
      filter: 'drop-shadow(3px 5px 0 rgba(42,38,32,0.22))',
      whiteSpace: 'nowrap',
      ...style,
    }}>{text}</PaperLayer>
  )
}

/* ---------- 1. Confetti scraps burst ---------- */
function CelConfetti({ playKey, word }) {
  const bits = useMemo(() => {
    const rng = mulberry32(playKey)
    const colors = PRAISE_COLORS
    const shapes = ['rect', 'circle', 'tri']
    return Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2 + rng() * 0.4
      const dist = 90 + rng() * 70
      return {
        i,
        x: Math.cos(a) * dist,
        y: Math.sin(a) * dist - 30,
        c: colors[i % colors.length],
        r: (rng() - 0.5) * 720,
        shape: shapes[i % shapes.length],
        delay: rng() * 100,
      }
    })
  }, [playKey])
  return (
    <div key={playKey} className="cel-root">
      <div style={{ animation: 'paper-bouncy 0.55s ease' }}>
        <WordCard word={word} size={180} />
      </div>
      <div className="cel-center">
        {bits.map((b) => (
          <span key={b.i} style={{
            position: 'absolute', left: 0, top: 0,
            transform: 'translate(-50%,-50%)',
            animation: `paper-confetti 1s cubic-bezier(.2,.7,.4,1) ${b.delay}ms forwards`,
            '--tx': `${b.x}px`, '--ty': `${b.y}px`, '--r': `${b.r}deg`,
          }}>
            <ConfettiScrap shape={b.shape} color={b.c} size={12} />
          </span>
        ))}
      </div>
      <div style={{ position: 'absolute', top: '12%' }}>
        <span style={{ animation: 'paper-pop 0.45s ease, paper-float 1s ease 0.5s both' }}>
          <PraiseTag text="Brawo!" color={PALETTE.coral} />
        </span>
      </div>
    </div>
  )
}

/* ---------- 2. Paper-star stamp ---------- */
function CelStamp({ playKey, word }) {
  return (
    <div key={playKey} className="cel-root">
      <div style={{ animation: 'paper-shake 0.4s ease 0.4s' }}>
        <WordCard word={word} size={180} />
      </div>
      <div style={{
        position: 'absolute', top: '4%',
        animation: 'paper-stamp 0.5s cubic-bezier(.4,1.6,.5,1) 0.05s both',
      }}>
        <PaperStar size={140} fill={PALETTE.mustard} rotate={-8} />
      </div>
      <div style={{
        position: 'absolute', top: '4%',
        fontFamily: 'var(--f-display)',
        fontSize: 36, fontWeight: 700, color: PALETTE.ink,
        animation: 'paper-stamp 0.5s cubic-bezier(.4,1.6,.5,1) 0.05s both',
        transform: 'translateY(38px)',
      }}>+1</div>
    </div>
  )
}

/* ---------- 3. Emoji multiply ---------- */
function CelMultiply({ playKey, word }) {
  const bits = useMemo(() => {
    const rng = mulberry32(playKey * 13)
    return Array.from({ length: 14 }, (_, i) => ({
      i,
      x: (rng() - 0.5) * 240,
      y: -110 - rng() * 90,
      r: (rng() - 0.5) * 60,
      s: 0.5 + rng() * 0.7,
      delay: rng() * 200,
    }))
  }, [playKey])
  return (
    <div key={playKey} className="cel-root">
      <div style={{ animation: 'paper-bouncy 0.5s ease' }}>
        <WordCard word={word} size={180} />
      </div>
      {bits.map((b) => (
        <span key={b.i} style={{
          position: 'absolute', left: '50%', top: '48%',
          fontSize: 36 * b.s,
          filter: 'drop-shadow(2px 3px 0 rgba(42,38,32,0.18))',
          transform: 'translate(-50%,-50%)',
          animation: `paper-multiply 1.1s ease ${b.delay}ms forwards`,
          '--mx': `${b.x}px`, '--my': `${b.y}px`, '--mr': `${b.r}deg`,
          pointerEvents: 'none',
        }}>{word.image}</span>
      ))}
    </div>
  )
}

/* ---------- 4. Praise balloons (paper tags float up) ---------- */
function CelBalloons({ playKey, word }) {
  const phrases = ['Brawo!', 'Super!', 'Tak!', 'Świetnie!', 'Pięknie!']
  return (
    <div key={playKey} className="cel-root">
      <WordCard word={word} size={180} />
      {phrases.map((p, i) => {
        const x = (i - 2) * 60 + (Math.random() - 0.5) * 16
        const delay = i * 90
        const rot = (i % 2 === 0 ? -1 : 1) * (3 + Math.random() * 6)
        return (
          <span key={i} style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%,-50%)',
            animation: `paper-balloon 1.6s ease ${delay}ms forwards`,
            '--bx': `${x}px`,
            pointerEvents: 'none',
          }}>
            <PraiseTag text={p} color={PRAISE_COLORS[i]} size={22} rotate={rot} />
          </span>
        )
      })}
    </div>
  )
}

/* ---------- 5. Paper-arc rainbow sweep ---------- */
function CelRainbow({ playKey, word }) {
  const arcs = [PALETTE.coral, PALETTE.mustard, PALETTE.mint, PALETTE.navy, PALETTE.rose]
  return (
    <div key={playKey} className="cel-root">
      <WordCard word={word} size={180} />
      <svg viewBox="0 0 320 280" width="100%" height="100%"
           style={{ position: 'absolute', pointerEvents: 'none' }}>
        {arcs.map((c, i) => (
          <path key={i}
                d={`M 30 ${230 - i * 9} Q 160 ${20 - i * 16} 290 ${230 - i * 9}`}
                fill="none" stroke={c} strokeWidth="13" strokeLinecap="round"
                opacity="0.95"
                strokeDasharray="600" strokeDashoffset="600"
                style={{
                  filter: 'drop-shadow(2px 4px 0 rgba(42,38,32,0.22))',
                  animation: `paper-draw 0.7s ease ${i * 70}ms forwards`,
                }} />
        ))}
      </svg>
      <div style={{ position: 'absolute', top: '12%', animation: 'paper-pop 0.45s ease 0.6s both' }}>
        <PraiseTag text="Tak jest!" color={PALETTE.coral} />
      </div>
    </div>
  )
}

/* ---------- 6. Plus-one drumroll ---------- */
function CelPlusOne({ playKey, word }) {
  return (
    <div key={playKey} className="cel-root">
      <div style={{ animation: 'paper-bouncy 0.5s ease 0.4s' }}>
        <WordCard word={word} size={180} />
      </div>
      <div style={{ position: 'absolute', top: '16%', display: 'flex', gap: 12 }}>
        {[0,1,2].map((i) => (
          <span key={i} style={{
            width: 16, height: 16, borderRadius: '50%',
            background: PALETTE.ink, opacity: 0,
            animation: `paper-dotbeat 0.25s ease ${i * 110}ms forwards`,
          }} />
        ))}
      </div>
      <div style={{
        position: 'absolute', top: '12%',
        animation: 'paper-plusone 0.55s cubic-bezier(.4,1.6,.5,1) 0.45s both',
      }}>
        <PaperLayer color={PALETTE.mint} rotate={-6} shadow={8} style={{
          padding: '10px 22px',
          borderRadius: 18,
          fontFamily: 'var(--f-display)',
          fontSize: 56, fontWeight: 700,
          color: PALETTE.ink,
        }}>+1</PaperLayer>
      </div>
    </div>
  )
}

/* ---------- 7. Milestone fireworks (paper bursts) ---------- */
function CelFireworks({ playKey, word }) {
  const bursts = [
    { x: 28, y: 28, c: PALETTE.coral,   d: 0 },
    { x: 72, y: 22, c: PALETTE.navy,    d: 200 },
    { x: 50, y: 58, c: PALETTE.mustard, d: 400 },
    { x: 18, y: 64, c: PALETTE.mint,    d: 600 },
    { x: 82, y: 60, c: PALETTE.rose,    d: 700 },
  ]
  return (
    <div key={playKey} className="cel-root">
      <div style={{ animation: 'paper-bouncy 0.55s ease' }}>
        <WordCard word={word} size={160} />
      </div>
      {bursts.map((b, idx) => (
        <svg key={idx} viewBox="0 0 100 100" width="160" height="160"
             style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`,
                      transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2
            const x2 = 50 + Math.cos(a) * 42
            const y2 = 50 + Math.sin(a) * 42
            return (
              <line key={i} x1="50" y1="50" x2={x2} y2={y2}
                    stroke={b.c} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray="50" strokeDashoffset="50"
                    style={{
                      filter: 'drop-shadow(2px 3px 0 rgba(42,38,32,0.22))',
                      animation: `paper-fw 0.7s ease ${b.d}ms forwards`,
                    }} />
            )
          })}
          <circle cx="50" cy="50" r="4" fill={b.c}
                  style={{
                    opacity: 0,
                    animation: `paper-fwdot 0.7s ease ${b.d}ms forwards`,
                    filter: 'drop-shadow(2px 3px 0 rgba(42,38,32,0.22))',
                  }} />
        </svg>
      ))}
      <div style={{ position: 'absolute', top: '4%', animation: 'paper-pop 0.45s ease 0.3s both' }}>
        <PraiseTag text="Wspaniale!" color={PALETTE.coral} size={42} rotate={-6} />
      </div>
    </div>
  )
}

const REGISTRY = {
  confetti:  CelConfetti,
  stamp:     CelStamp,
  multiply:  CelMultiply,
  balloons:  CelBalloons,
  rainbow:   CelRainbow,
  plusone:   CelPlusOne,
  fireworks: CelFireworks,
}

export const CELEBRATION_KINDS = ['confetti', 'stamp', 'multiply', 'balloons', 'rainbow', 'plusone']

export function Celebration({ kind, word, playKey }) {
  const Cmp = REGISTRY[kind]
  if (!Cmp) return null
  return <Cmp playKey={playKey} word={word} />
}
