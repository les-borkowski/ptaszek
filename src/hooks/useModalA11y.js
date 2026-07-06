import { useEffect, useEffectEvent } from 'react'

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Focuses the first focusable element on mount, restores focus to whatever
// was focused before on unmount, closes on Escape, and traps Tab/Shift+Tab
// cycling within `cardRef`. Only sets up/tears down once per mount — a
// non-reactive effect event reads the latest onClose without retriggering
// setup when the parent passes a new inline closure each render.
export function useModalA11y(cardRef, onClose) {
  const handleEscape = useEffectEvent(() => onClose())

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const previouslyFocused = document.activeElement
    const focusables = () => [...card.querySelectorAll(FOCUSABLE_SELECTOR)]

    // Respect an element that already grabbed focus via autoFocus; only
    // move focus ourselves if nothing inside the card is focused yet.
    if (!card.contains(document.activeElement)) {
      focusables()[0]?.focus()
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        handleEscape()
        return
      }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    card.addEventListener('keydown', handleKeyDown)
    return () => {
      card.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [cardRef])
}
