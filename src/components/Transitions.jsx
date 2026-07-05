import { useEffect, useRef, useState } from 'react'
import { WordCard } from './Paper'

/* =====================================================
   Transitions.jsx — random word-to-word transition.
   Cut-paper feel: things slide / flip / drop / tear / pop.
   ===================================================== */

export const TRANSITION_KINDS = ['slide', 'flip', 'drop', 'tear', 'pop']

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

export function WordTransition({ word, size = 220 }) {
  const [variant, setVariant] = useState(() => pickRandom(TRANSITION_KINDS))
  const [renderKey, setRenderKey] = useState(0)
  const prev = useRef(word.word)

  useEffect(() => {
    if (prev.current !== word.word) {
      setVariant(pickRandom(TRANSITION_KINDS))
      setRenderKey((k) => k + 1)
      prev.current = word.word
    }
  }, [word])

  return (
    <div style={{
      position: 'relative',
      width: size + 40,
      height: size + 40,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div key={renderKey} className={`word-trans word-trans-${variant}`}>
        <WordCard word={word} size={size} />
      </div>
    </div>
  )
}
