export function playAudio(src) {
  return new Promise((resolve) => {
    const audio = new Audio(src)
    audio.onended = resolve
    audio.onerror = resolve
    audio.play().catch(resolve)
  })
}
