/**
 * Converts any text to a safe ASCII filename (no Polish chars, no %).
 * Uses encodeURIComponent then replaces % with _ so the result is
 * filesystem-safe and matches what generate-audio.mjs writes to disk.
 *
 * Examples:
 *   "Cześć"      → "Cze_C5_9B_C4_87"
 *   "jabłko"     → "jab_C5_82ko"
 *   "Tak jest!"  → "Tak_20jest_21"
 */
export function wordToFilename(text) {
  return encodeURIComponent(text).replace(/%/g, '_')
}
