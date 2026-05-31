// scripts/generate-audio.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const API_KEY = process.env.GOOGLE_TTS_API_KEY
if (!API_KEY) {
  console.error('Error: GOOGLE_TTS_API_KEY environment variable is required')
  process.exit(1)
}

const WORD_VOICE = { languageCode: 'pl-PL', name: 'pl-PL-Neural2-A' }
const PRAISE_VOICE = { languageCode: 'pl-PL', name: 'pl-PL-Neural2-A', ssmlGender: 'FEMALE' }
const AUDIO_CONFIG = { audioEncoding: 'MP3' }

async function synthesize(text, voice) {
  const res = await fetch(
    `https://texttosynthesis.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: { text }, voice, audioConfig: AUDIO_CONFIG }),
    }
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TTS API error ${res.status}: ${body}`)
  }
  const { audioContent } = await res.json()
  return Buffer.from(audioContent, 'base64')
}

async function generateFile(destPath, text, voice) {
  if (existsSync(destPath)) {
    console.log(`  skip  ${text}`)
    return
  }
  const audio = await synthesize(text, voice)
  writeFileSync(destPath, audio)
  console.log(`  wrote ${text}`)
}

// Words
const wordsJson = JSON.parse(readFileSync(resolve(root, 'src/data/words.json'), 'utf8'))
const allWords = [...new Set(Object.values(wordsJson).flat().map(w => w.word))]
const wordsDir = resolve(root, 'public/audio/words')
mkdirSync(wordsDir, { recursive: true })

console.log(`\nGenerating ${allWords.length} word files…`)
for (const word of allWords) {
  await generateFile(resolve(wordsDir, `${word}.mp3`), word, WORD_VOICE)
}

// Praise phrases — must match PRAISE_PHRASES in src/App.jsx
const PRAISE_PHRASES = ['Brawo!', 'Super!', 'Świetnie!', 'Tak jest!', 'Wspaniale!', 'Pięknie!']
const praiseDir = resolve(root, 'public/audio/praise')
mkdirSync(praiseDir, { recursive: true })

console.log(`\nGenerating ${PRAISE_PHRASES.length} praise files…`)
for (const phrase of PRAISE_PHRASES) {
  await generateFile(resolve(praiseDir, `${phrase}.mp3`), phrase, PRAISE_VOICE)
}

console.log('\nDone.')
