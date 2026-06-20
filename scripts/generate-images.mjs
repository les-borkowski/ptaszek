// scripts/generate-images.mjs
//
// Generates word images via the Recraft API and saves them to public/images/words/.
// Skips categories that will be generated programmatically: numbers, colours, shapes.
// Skips files that already exist — safe to re-run after partial completion.
//
// Usage:
//   npm run generate:images
//   npm run generate:images -- --regen zazdrosny,dumny
//   npm run generate:images -- --style-id <recraft_style_id>
//   npm run generate:images -- --dry-run

import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const API_KEY = process.env.RECRAFT_API_KEY
if (!API_KEY) {
  console.error('Error: RECRAFT_API_KEY env var is required')
  console.error('  export RECRAFT_API_KEY=your_api_key')
  console.error('  or copy .env.example to .env and fill it in')
  process.exit(1)
}

// --- Config ---

const MODEL = 'recraftv4_1_vector'
const SKIP_CATEGORIES = new Set(['numbers', 'colours', 'shapes'])
const PROMPT_PREFIX = 'bold graphic illustration, screen-print aesthetic, '
const PROMPT_SUFFIX = ', strong readable shapes, white background, no text, no letters, no numbers'
const COST_PER_IMAGE = 0.08

// --- CLI args ---
// --regen word1,word2   force-overwrite specific words (comma-separated)
// --style-id <id>       lock a Recraft style_id for visual consistency
// --dry-run             print prompts without calling the API

const args = process.argv.slice(2)

function getArg(flag) {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : null
}

const dryRun = args.includes('--dry-run')
const styleId = getArg('--style-id')
const regenWords = new Set(
  getArg('--regen') ? getArg('--regen').split(',').map(w => w.trim()) : []
)

// --- Rate limiter ---

class RateLimiter {
  #minInterval
  #lastTime = 0
  constructor(requestsPerMinute) {
    this.#minInterval = 60_000 / requestsPerMinute
  }
  async wait() {
    const wait = this.#minInterval - (Date.now() - this.#lastTime)
    if (wait > 0) await new Promise(r => setTimeout(r, wait))
    this.#lastTime = Date.now()
  }
}

const rateLimiter = new RateLimiter(60)

// --- Filename encoding (matches src/utils/audioFilename.js) ---

function wordToFilename(text) {
  return encodeURIComponent(text).replace(/%/g, '_')
}

// --- Recraft API ---

async function generateImage(prompt) {
  await rateLimiter.wait()
  const body = { prompt, model: MODEL, response_format: 'url' }
  if (styleId) body.style_id = styleId

  const res = await fetch('https://external.api.recraft.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Recraft API ${res.status}: ${text}`)
  }

  const { data } = await res.json()
  return data[0].url
}

async function downloadFile(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function generateFile(destPath, prompt, word) {
  if (existsSync(destPath)) {
    console.log(`  skip   ${word}`)
    return
  }
  if (dryRun) {
    console.log(`  [dry]  ${word}`)
    console.log(`         ${prompt}\n`)
    return
  }
  const url = await generateImage(prompt)
  const data = await downloadFile(url)
  writeFileSync(destPath, data)
  console.log(`  wrote  ${word}`)
}

// --- Build word list ---

const wordsJson = JSON.parse(readFileSync(resolve(root, 'src/data/words.json'), 'utf8'))
const imageDescriptions = JSON.parse(readFileSync(resolve(root, 'src/data/imageDescriptions.json'), 'utf8'))

const seen = new Set()
const wordList = []

for (const [catId, entries] of Object.entries(wordsJson)) {
  if (SKIP_CATEGORIES.has(catId)) continue
  for (const entry of entries) {
    if (seen.has(entry.word)) continue
    seen.add(entry.word)
    const description = imageDescriptions[entry.word] ?? entry.translation ?? entry.word
    const prompt = `${PROMPT_PREFIX}${description}${PROMPT_SUFFIX}`
    wordList.push({ word: entry.word, prompt })
  }
}

// File extension — vector model returns SVG
const EXT = 'svg'

// --- Summary ---

const existing = wordList.filter(({ word }) =>
  !regenWords.has(word) && existsSync(resolve(root, 'public/images/words', `${wordToFilename(word)}.${EXT}`))
).length
const toGenerate = wordList.length - existing

console.log(`Model:      ${MODEL}`)
console.log(`Format:     .${EXT}`)
if (styleId) console.log(`Style ID:   ${styleId}`)
if (dryRun)  console.log(`Mode:       DRY RUN (no API calls)`)
console.log(`Words:      ${wordList.length} total, ${existing} already exist, ${toGenerate} to generate`)
if (regenWords.size > 0) console.log(`Regen:      ${[...regenWords].join(', ')}`)
console.log(`Est. cost:  $${(toGenerate * COST_PER_IMAGE).toFixed(2)} @ $${COST_PER_IMAGE}/image`)
console.log()

// --- Main ---

const imagesDir = resolve(root, 'public/images/words')
mkdirSync(imagesDir, { recursive: true })

let errors = 0
for (const { word, prompt } of wordList) {
  const destPath = resolve(imagesDir, `${wordToFilename(word)}.${EXT}`)
  if (regenWords.has(word) && existsSync(destPath)) {
    unlinkSync(destPath)
  }
  try {
    await generateFile(destPath, prompt, word)
  } catch (err) {
    console.error(`  ERROR  ${word}: ${err.message}`)
    errors++
  }
}

if (errors > 0) console.warn(`\n  ${errors} file(s) failed — re-run to retry.`)
console.log('\nDone.')
