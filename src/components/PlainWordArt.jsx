/* =====================================================
   PlainWordArt.jsx — plain CSS/SVG art for categories that
   intentionally skip the illustrated-PNG pipeline: numbers,
   colours, shapes. Rendered by WordImage (Paper.jsx) only as
   a fallback once a word's PNG fails to load, so any word in
   these categories that *does* have a real illustration (e.g.
   "serce") is unaffected.
   ===================================================== */

export const PLAIN_ART_CATEGORIES = new Set(['numbers', 'colours', 'shapes'])

const INK = '#3f3f3f'

// Hand-picked pale/watercolour-ish tones, keyed by the Polish word (matches
// the keying convention in src/data/imageDescriptions.json). Not raw CSS
// colour names — "biały"/"czarny" need to stay visibly distinct from the
// cream card, and everything should read as soft/pale rather than saturated.
const COLOUR_SWATCH = {
  czerwony:     '#D98E86',
  niebieski:    '#8FB2D9',
  żółty:        '#E8D07E',
  zielony:      '#9BC7A0',
  pomarańczowy: '#E8B57E',
  fioletowy:    '#C4A6D6',
  różowy:       '#E9B9CE',
  brązowy:      '#B99777',
  czarny:       '#6E6E6E',
  biały:        '#FBFAF6',
  szary:        '#B7B6AF',
  złoty:        '#DDBE6E',
  srebrny:      '#C7C8CC',
  beżowy:       '#DFCBA8',
  turkusowy:    '#8AC9C0',
}
const DEFAULT_SWATCH = '#C9C4B8'

// Most numbers are 1-2 digits and read well at 2/3 of the tile height; the
// two long ones ("100", "1000") need to shrink to still fit on one line.
function numberFontScale(value) {
  const digits = String(value).length
  if (digits <= 2) return 2 / 3
  if (digits === 3) return 0.48
  return 0.36
}

function NumberArt({ value, size, fill, style }) {
  const dims = fill ? { width: '100%', height: '100%' } : { width: size, height: size }
  const fontSize = Math.round((size ?? 100) * numberFontScale(value))
  return (
    <div style={{
      ...dims,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--f-display, sans-serif)',
      fontWeight: 800,
      fontSize,
      lineHeight: 1,
      color: INK,
      ...style,
    }}>
      {value}
    </div>
  )
}

function ColourArt({ word, size, fill, style }) {
  const dims = fill ? { width: '100%', height: '100%' } : { width: size, height: size }
  const swatch = COLOUR_SWATCH[word] ?? DEFAULT_SWATCH
  return (
    <div style={{
      ...dims,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <div style={{
        width: '70%', height: '70%', borderRadius: '50%',
        background: swatch,
        border: `2px solid rgba(58, 58, 58, 0.18)`,
      }} />
    </div>
  )
}

// Pale watercolour-style stroke used to outline every filled shape.
const SHAPE_STROKE = 'rgba(58, 58, 58, 0.25)'

// One pale watercolour tone per shape, so the category reads as colourful
// rather than a monochrome outline set.
const SHAPE_COLOUR = {
  circle:     '#8FB2D9',
  square:     '#E39A94',
  rectangle:  '#EFC48A',
  triangle:   '#A8CDA8',
  star:       '#EAD98A',
  heart:      '#EBB8CB',
  diamond:    '#C7ACDA',
  oval:       '#8FCFC4',
  semicircle: '#E0C27A',
  cube:       '#C2A582',
  arrow:      '#B7C6D9',
  cross:      '#D9A8A0',
}
const DEFAULT_SHAPE_COLOUR = '#C9C4B8'

// Simple flat primitives in a 0-100 viewBox, keyed by the English shape name
// (already stored as each word's `translation`).
const SHAPE_RENDERERS = {
  circle:      (c) => <circle cx="50" cy="50" r="38" fill={c} stroke={SHAPE_STROKE} strokeWidth="2" />,
  square:      (c) => <rect x="14" y="14" width="72" height="72" rx="6" fill={c} stroke={SHAPE_STROKE} strokeWidth="2" />,
  rectangle:   (c) => <rect x="8" y="26" width="84" height="48" rx="6" fill={c} stroke={SHAPE_STROKE} strokeWidth="2" />,
  triangle:    (c) => (
    <polygon points="50,10 90,88 10,88" fill={c} stroke={SHAPE_STROKE} strokeWidth="2" strokeLinejoin="round" />
  ),
  star:        (c) => (
    <polygon
      fill={c}
      stroke={SHAPE_STROKE}
      strokeWidth="2"
      strokeLinejoin="round"
      points="50,6 61,38 95,38 67,58 78,90 50,70 22,90 33,58 5,38 39,38"
    />
  ),
  heart:       (c) => (
    <path
      fill={c}
      stroke={SHAPE_STROKE}
      strokeWidth="2"
      d="M50,88 C15,64 6,42 6,28 C6,12 20,4 32,4 C42,4 48,12 50,18 C52,12 58,4 68,4 C80,4 94,12 94,28 C94,42 85,64 50,88 Z"
    />
  ),
  diamond:     (c) => (
    <polygon points="50,6 92,50 50,94 8,50" fill={c} stroke={SHAPE_STROKE} strokeWidth="2" strokeLinejoin="round" />
  ),
  oval:        (c) => <ellipse cx="50" cy="50" rx="44" ry="30" fill={c} stroke={SHAPE_STROKE} strokeWidth="2" />,
  semicircle:  (c) => (
    <path d="M8,58 A42,42 0 0 1 92,58 Z" fill={c} stroke={SHAPE_STROKE} strokeWidth="2" strokeLinejoin="round" />
  ),
  cube:        (c) => (
    <g fill="none" stroke={c} strokeWidth="5" strokeLinejoin="round">
      <rect x="14" y="30" width="52" height="52" />
      <polyline points="14,30 34,12 86,12 66,30" />
      <polyline points="66,30 86,12 86,64 66,82" />
    </g>
  ),
  arrow:       (c) => (
    <polygon fill={c} stroke={SHAPE_STROKE} strokeWidth="2" strokeLinejoin="round" points="8,40 60,40 60,20 92,50 60,80 60,60 8,60" />
  ),
  cross:       (c) => (
    <polygon
      fill={c}
      stroke={SHAPE_STROKE}
      strokeWidth="2"
      strokeLinejoin="round"
      points="36,6 64,6 64,36 94,36 94,64 64,64 64,94 36,94 36,64 6,64 6,36 36,36"
    />
  ),
}

function ShapeArt({ word, size, fill: fillProp, style }) {
  const dims = fillProp ? { width: '100%', height: '100%' } : { width: size, height: size }
  const renderShape = SHAPE_RENDERERS[word] ?? SHAPE_RENDERERS.circle
  const colour = SHAPE_COLOUR[word] ?? DEFAULT_SHAPE_COLOUR
  return (
    <div style={{
      ...dims,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <svg viewBox="0 0 100 100" style={{ width: '70%', height: '70%' }}>
        {renderShape(colour)}
      </svg>
    </div>
  )
}

export function PlainWordArt({ word, size, fill, style }) {
  switch (word.category) {
    case 'numbers':
      return <NumberArt value={word.translation} size={size} fill={fill} style={style} />
    case 'colours':
      return <ColourArt word={word.word} size={size} fill={fill} style={style} />
    case 'shapes':
      return <ShapeArt word={word.translation} size={size} fill={fill} style={style} />
    default:
      return null
  }
}
