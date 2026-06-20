// scripts/generate-audio.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs'
import { createSign } from 'crypto'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const KEY_FILE = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!KEY_FILE) {
  console.error('Error: GOOGLE_APPLICATION_CREDENTIALS env var must point to your service account JSON key file')
  console.error('  export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json')
  process.exit(1)
}

// --- Auth ---

async function getAccessToken() {
  const key = JSON.parse(readFileSync(KEY_FILE, 'utf8'))
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: key.token_uri,
    exp: now + 3600,
    iat: now,
  })).toString('base64url')
  const sign = createSign('RSA-SHA256')
  sign.update(`${header}.${payload}`)
  const signature = sign.sign(key.private_key, 'base64url')
  const jwt = `${header}.${payload}.${signature}`

  const res = await fetch(key.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Token error ${res.status}: ${body}`)
  }
  const { access_token } = await res.json()
  return access_token
}

// --- Rate limiter: 200 requests / minute ---

class RateLimiter {
  #minInterval  // ms between requests
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

const rateLimiter = new RateLimiter(200)

// --- TTS ---

const VOICE = { languageCode: 'pl-PL', name: 'pl-PL-Chirp3-HD-Aoede' }
const AUDIO_CONFIG = { audioEncoding: 'MP3' }

async function synthesize(text, token) {
  await rateLimiter.wait()
  const res = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ input: { text }, voice: VOICE, audioConfig: AUDIO_CONFIG }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TTS API error ${res.status}: ${body}`)
  }
  const { audioContent } = await res.json()
  return Buffer.from(audioContent, 'base64')
}

async function generateFile(destPath, text, token) {
  if (existsSync(destPath)) {
    console.log(`  skip  ${text}`)
    return
  }
  const audio = await synthesize(text, token)
  writeFileSync(destPath, audio)
  console.log(`  wrote ${text}`)
}

// --- Filename encoding (must match src/utils/audioFilename.js) ---

function wordToFilename(text) {
  return encodeURIComponent(text).replace(/%/g, '_')
}

// --- CLI args ---
// --regen word1,word2   force-overwrite specific words (comma-separated, no spaces)

const regenArg = process.argv.indexOf('--regen')
const regenWords = new Set(
  regenArg !== -1 && process.argv[regenArg + 1]
    ? process.argv[regenArg + 1].split(',').map(w => w.trim())
    : []
)

if (regenWords.size > 0) {
  console.log(`Force-regenerating: ${[...regenWords].join(', ')}\n`)
}

// --- Character budget check ---

const wordsJson = JSON.parse(readFileSync(resolve(root, 'src/data/words.json'), 'utf8'))
const allWords = [...new Set(Object.values(wordsJson).flat().map(w => w.word))]
const PRAISE_PHRASES = ['Brawo!', 'Super!', 'Świetnie!', 'Tak jest!', 'Wspaniale!', 'Pięknie!']
const totalChars = [...allWords, ...PRAISE_PHRASES].reduce((n, t) => n + t.length, 0)

console.log(`Voice: ${VOICE.name}`)
console.log(`Requests: ${allWords.length} words + ${PRAISE_PHRASES.length} praise = ${allWords.length + PRAISE_PHRASES.length} total`)
console.log(`Characters: ${totalChars.toLocaleString()} / 1,000,000 free tier (${(totalChars / 1_000_000 * 100).toFixed(2)}%)`)
console.log(`Rate limit: 200 req/min\n`)

// --- Main ---

const token = await getAccessToken()
console.log('Authenticated via service account.\n')

const wordsDir = resolve(root, 'public/audio/words')
mkdirSync(wordsDir, { recursive: true })
console.log(`Generating ${allWords.length} word files…`)
let wordErrors = 0
for (const word of allWords) {
  const destPath = resolve(wordsDir, `${wordToFilename(word)}.mp3`)
  if (regenWords.has(word) && existsSync(destPath)) {
    unlinkSync(destPath)
  }
  try {
    await generateFile(destPath, word, token)
  } catch (err) {
    console.error(`  ERROR ${word}: ${err.message}`)
    wordErrors++
  }
}
if (wordErrors > 0) console.warn(`\n  ${wordErrors} word file(s) failed — re-run to retry.`)

const praiseDir = resolve(root, 'public/audio/praise')
mkdirSync(praiseDir, { recursive: true })
console.log(`\nGenerating ${PRAISE_PHRASES.length} praise files…`)
let praiseErrors = 0
for (const phrase of PRAISE_PHRASES) {
  try {
    await generateFile(resolve(praiseDir, `${wordToFilename(phrase)}.mp3`), phrase, token)
  } catch (err) {
    console.error(`  ERROR ${phrase}: ${err.message}`)
    praiseErrors++
  }
}
if (praiseErrors > 0) console.warn(`\n  ${praiseErrors} praise file(s) failed — re-run to retry.`)

console.log('\nDone.')
