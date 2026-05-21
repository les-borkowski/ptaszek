/**
 * Returns true if the recognized transcript contains the target Polish word.
 * Normalizes both strings to lowercase and trims whitespace.
 *
 * @param {string} transcript - Raw text from speech recognizer
 * @param {string} target - The Polish word to match against
 * @returns {boolean}
 */
export function fuzzyMatch(transcript, target) {
  if (!transcript || !target) return false
  const normalizedTranscript = transcript.toLowerCase().trim()
  const normalizedTarget = target.toLowerCase().trim()
  if (!normalizedTarget) return false
  return normalizedTranscript.includes(normalizedTarget)
}
