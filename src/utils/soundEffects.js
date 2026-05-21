/**
 * Plays a rising two-tone beep to signal a correct answer.
 */
export function playSuccess() {
  const ctx = new AudioContext()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(440, ctx.currentTime)
  oscillator.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.2)

  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.4)
}

/**
 * Plays a falling low beep to signal a wrong answer.
 */
export function playError() {
  const ctx = new AudioContext()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(300, ctx.currentTime)
  oscillator.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.3)

  gain.gain.setValueAtTime(0.3, ctx.currentTime)
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.4)
}
