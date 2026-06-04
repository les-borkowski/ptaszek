const TIMEOUT_MS = 10_000

export function playAudio(src) {
  return new Promise((resolve) => {
    const audio = new Audio(src)
    let timer

    const done = () => {
      clearTimeout(timer)
      audio.onended = null
      audio.onerror = null
      resolve()
    }

    timer = setTimeout(done, TIMEOUT_MS)
    audio.onended = done
    audio.onerror = done
    audio.play().catch(done)
  })
}
