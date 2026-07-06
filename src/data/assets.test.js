import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import words from './words.json'
import { wordToFilename } from '../utils/audioFilename'

// Categories that intentionally ship without an illustration and fall back
// to the word's emoji (see WordImage in Paper.jsx).
const EMOJI_FALLBACK_CATEGORIES = ['numbers', 'colours', 'shapes']

const dirname = path.dirname(fileURLToPath(import.meta.url))
const AUDIO_DIR = path.resolve(dirname, '../../public/audio/words')
const IMAGE_DIR = path.resolve(dirname, '../../public/images/words')

describe('generated word assets', () => {
  test('every word has a matching mp3 in public/audio/words', () => {
    const missing = []
    for (const entries of Object.values(words)) {
      for (const { word } of entries) {
        const file = path.join(AUDIO_DIR, `${wordToFilename(word)}.mp3`)
        if (!existsSync(file)) missing.push(word)
      }
    }
    expect(missing).toEqual([])
  })

  test('every word outside the emoji-fallback categories has a matching png in public/images/words', () => {
    const missing = []
    for (const [category, entries] of Object.entries(words)) {
      if (EMOJI_FALLBACK_CATEGORIES.includes(category)) continue
      for (const { word } of entries) {
        const file = path.join(IMAGE_DIR, `${wordToFilename(word)}.png`)
        if (!existsSync(file)) missing.push(`${category}/${word}`)
      }
    }
    expect(missing).toEqual([])
  })

  test('emoji-fallback categories still have an emoji for every word', () => {
    for (const category of EMOJI_FALLBACK_CATEGORIES) {
      for (const entry of words[category] ?? []) {
        expect(typeof entry.emoji).toBe('string')
        expect(entry.emoji.length).toBeGreaterThan(0)
      }
    }
  })

  test('sanity check: the asset directories are not empty', () => {
    expect(readdirSync(AUDIO_DIR).length).toBeGreaterThan(0)
    expect(readdirSync(IMAGE_DIR).length).toBeGreaterThan(0)
  })
})
