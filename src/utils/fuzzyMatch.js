/**
 * Returns true if the recognized transcript contains the target Polish word
 * as a whole word (unicode-aware word-boundary matching).
 * Normalizes both strings to lowercase and trims whitespace.
 *
 * @param {string} transcript - Raw text from speech recognizer
 * @param {string} target - The Polish word to match against
 * @returns {boolean}
 */
export function fuzzyMatch(transcript, target) {
  if (!transcript || !target) return false
  const t = transcript.toLowerCase().trim()
  const q = target.toLowerCase().trim()
  if (!q) return false
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Unicode-aware word boundary: not preceded/followed by a letter or digit
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'iu')
  return re.test(t)
}
