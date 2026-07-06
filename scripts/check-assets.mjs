#!/usr/bin/env node
// Reports words.json entries that are missing a generated audio (mp3) or
// illustration (png), and any files in public/audio|images/words that no
// longer correspond to a word. Report-only tool — always exits 0.
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import words from '../src/data/words.json' with { type: 'json' }
import { wordToFilename } from '../src/utils/audioFilename.js'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const AUDIO_DIR = path.join(ROOT, 'public/audio/words')
const IMAGE_DIR = path.join(ROOT, 'public/images/words')

const audioFiles = new Set(readdirSync(AUDIO_DIR))
const imageFiles = new Set(readdirSync(IMAGE_DIR))

const usedAudio = new Set()
const usedImages = new Set()
const missingAudio = {}
const missingImages = {}

for (const [category, list] of Object.entries(words)) {
  for (const { word } of list) {
    const filename = wordToFilename(word)
    const audioName = `${filename}.mp3`
    const imageName = `${filename}.png`

    usedAudio.add(audioName)
    usedImages.add(imageName)

    if (!audioFiles.has(audioName)) {
      (missingAudio[category] ??= []).push(word)
    }
    if (!imageFiles.has(imageName)) {
      (missingImages[category] ??= []).push(word)
    }
  }
}

const orphanedAudio = [...audioFiles].filter((f) => !usedAudio.has(f)).sort()
const orphanedImages = [...imageFiles].filter((f) => !usedImages.has(f)).sort()

function report(title, byCategory) {
  const entries = Object.entries(byCategory)
  if (entries.length === 0) {
    console.log(`${title}: none`)
    return
  }
  console.log(`${title}:`)
  for (const [category, list] of entries) {
    console.log(`  ${category} (${list.length}): ${list.join(', ')}`)
  }
}

report('Missing audio (mp3)', missingAudio)
report('Missing images (png)', missingImages)
console.log(`Orphaned audio files (no matching word): ${orphanedAudio.length === 0 ? 'none' : orphanedAudio.join(', ')}`)
console.log(`Orphaned image files (no matching word): ${orphanedImages.length === 0 ? 'none' : orphanedImages.join(', ')}`)
