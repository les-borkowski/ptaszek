// scripts/generate-images-gemini.mjs
//
// Generates word images via the Gemini (Nano Banana 2) Batch API and saves
// them to public/images/words/. Runs in phases since batch jobs can take up
// to 24h to complete. --submit only ever includes words that don't already
// have a file in public/images/words/, so --limit N submits the next N
// missing words — safe to re-run in chunks without re-billing finished ones:
//
//   npm run generate:images:gemini -- --anchors                     generate style-anchor images
//   npm run generate:images:gemini -- --submit --limit 5 --dry-run  sanity-check prompts first
//   npm run generate:images:gemini -- --submit --limit 50           batch of the next 50 missing words
//   npm run generate:images:gemini -- --status                      check job status
//   npm run generate:images:gemini -- --fetch                       download results once succeeded
//   npm run generate:images:gemini -- --submit                      all remaining missing words
//
// NOTE: the exact response shape for file-based batch output (job.dest) is
// not fully confirmed against the live API as of writing. Run --status
// after submitting and inspect the printed job object — adjust
// fetchResults() below if job.dest doesn't match what's coded here.
// Recommended: run a small --limit batch end-to-end before submitting the
// full word list.

import { GoogleGenAI } from '@google/genai'
import { readFileSync, writeFileSync, mkdirSync, existsSync, createReadStream } from 'fs'
import { createInterface } from 'readline'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const API_KEY = process.env.GEMINI_API_KEY
if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY env var is required')
  console.error('  export GEMINI_API_KEY=your_api_key')
  console.error('  or copy .env.example to .env and fill it in')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey: API_KEY })

// --- Config ---

const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image'
const SKIP_CATEGORIES = new Set(['numbers', 'colours', 'shapes'])
const PROMPT_PREFIX = 'soft pastel watercolour illustration, gentle paper texture, '
const PROMPT_SUFFIX = ', strong readable shapes, white background, no text, no letters, no numbers'
const ASPECT_RATIO = '1:1'
const IMAGE_SIZE = '1K'

// One animal, one object/scene, one person — establishes the style across
// the range of subjects the full word list needs to cover.
const ANCHOR_WORDS = ['kot', 'dom', 'lekarz']

const anchorsDir = resolve(root, 'public/images/style-anchors')
const wordsImagesDir = resolve(root, 'public/images/words')
const jobStatePath = resolve(root, '.gemini-batch-job.json')
const batchRequestsPath = resolve(root, 'scripts/.batch-requests.jsonl')

// --- CLI args ---

const args = process.argv.slice(2)
const has = (flag) => args.includes(flag)
function getArg(flag) {
  const i = args.indexOf(flag)
  return i !== -1 ? args[i + 1] : null
}

const dryRun = has('--dry-run')
const limit = getArg('--limit') ? Number(getArg('--limit')) : null

// --- Filename encoding (matches src/utils/audioFilename.js) ---

function wordToFilename(text) {
  return encodeURIComponent(text).replace(/%/g, '_')
}

// --- Word list ---

function buildWordList() {
  const wordsJson = JSON.parse(readFileSync(resolve(root, 'src/data/words.json'), 'utf8'))
  const imageDescriptions = JSON.parse(readFileSync(resolve(root, 'src/data/imageDescriptions.json'), 'utf8'))

  const seen = new Set()
  const wordList = []
  for (const [catId, entries] of Object.entries(wordsJson)) {
    if (SKIP_CATEGORIES.has(catId)) continue
    for (const entry of entries) {
      if (seen.has(entry.word)) continue
      seen.add(entry.word)
      const key = wordToFilename(entry.word)
      if (existsSync(resolve(wordsImagesDir, `${key}.png`))) continue
      const description = imageDescriptions[entry.word] ?? entry.translation ?? entry.word
      const prompt = `${PROMPT_PREFIX}${description}${PROMPT_SUFFIX}`
      wordList.push({ word: entry.word, key, prompt })
    }
  }
  return wordList
}

// --- Phase 1: style anchors ---
// Generated synchronously (not via batch) so you can review/regenerate them
// quickly before locking in the style for the full-word batch.

async function generateAnchors() {
  mkdirSync(anchorsDir, { recursive: true })
  const imageDescriptions = JSON.parse(readFileSync(resolve(root, 'src/data/imageDescriptions.json'), 'utf8'))

  for (const word of ANCHOR_WORDS) {
    const description = imageDescriptions[word]
    if (!description) throw new Error(`No imageDescriptions entry for anchor word "${word}"`)
    const prompt = `${PROMPT_PREFIX}${description}${PROMPT_SUFFIX}`
    const destPath = resolve(anchorsDir, `${word}.png`)

    if (dryRun) {
      console.log(`  [dry]  ${word}\n         ${prompt}\n`)
      continue
    }

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ text: prompt }],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: ASPECT_RATIO, imageSize: IMAGE_SIZE },
      },
    })

    const imagePart = response.candidates[0].content.parts.find((p) => p.inlineData)
    if (!imagePart) throw new Error(`No image returned for anchor "${word}"`)
    writeFileSync(destPath, Buffer.from(imagePart.inlineData.data, 'base64'))
    console.log(`  wrote  ${destPath}`)
  }
}

// --- Phase 2: submit batch job ---

async function uploadAnchors() {
  const uploaded = []
  for (const word of ANCHOR_WORDS) {
    const path = resolve(anchorsDir, `${word}.png`)
    if (!existsSync(path)) {
      throw new Error(`Missing anchor image ${path} — run --anchors first`)
    }
    const file = await ai.files.upload({ file: path, config: { mimeType: 'image/png' } })
    uploaded.push(file)
    console.log(`  uploaded anchor  ${word} -> ${file.uri}`)
  }
  return uploaded
}

async function submitBatch() {
  const remaining = buildWordList()
  const wordList = limit ? remaining.slice(0, limit) : remaining

  console.log(`Model:      ${MODEL}`)
  console.log(`Words:      ${wordList.length} this batch, ${remaining.length} missing overall`)
  if (dryRun) console.log('Mode:       DRY RUN (no API calls)')
  console.log()

  if (dryRun) {
    for (const { word, prompt } of wordList) {
      console.log(`  [dry]  ${word}\n         ${prompt}\n`)
    }
    return
  }

  const anchorFiles = await uploadAnchors()
  const anchorParts = anchorFiles.map((f) => ({ fileData: { fileUri: f.uri, mimeType: f.mimeType } }))

  const lines = wordList.map(({ key, prompt }) => JSON.stringify({
    key,
    request: {
      contents: [{ parts: [...anchorParts, { text: prompt }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: ASPECT_RATIO, imageSize: IMAGE_SIZE },
      },
    },
  }))
  writeFileSync(batchRequestsPath, lines.join('\n') + '\n')
  console.log(`  wrote  ${batchRequestsPath} (${lines.length} requests)`)

  const uploadedRequests = await ai.files.upload({
    file: batchRequestsPath,
    config: { mimeType: 'jsonl' },
  })

  const batchJob = await ai.batches.create({
    model: MODEL,
    src: uploadedRequests.name,
    config: { displayName: `slowik-word-images-${Date.now()}` },
  })

  writeFileSync(jobStatePath, JSON.stringify({
    jobName: batchJob.name,
    model: MODEL,
    submittedAt: new Date().toISOString(),
    wordCount: wordList.length,
  }, null, 2))

  console.log(`\nBatch job submitted: ${batchJob.name}`)
  console.log(`Saved to ${jobStatePath} — check back with --status, download with --fetch once succeeded.`)
}

// --- Phase 3: status ---

function loadJobState() {
  if (!existsSync(jobStatePath)) {
    throw new Error(`No batch job on record (${jobStatePath} missing) — run --submit first`)
  }
  return JSON.parse(readFileSync(jobStatePath, 'utf8'))
}

async function checkStatus() {
  const { jobName } = loadJobState()
  const job = await ai.batches.get({ name: jobName })
  console.log(`State: ${job.state}`)
  console.log(JSON.stringify(job, null, 2))
}

// --- Phase 4: fetch results ---

async function fetchResults() {
  const { jobName } = loadJobState()
  const job = await ai.batches.get({ name: jobName })

  if (job.state !== 'JOB_STATE_SUCCEEDED') {
    console.log(`Job not finished yet — state: ${job.state}`)
    return
  }

  mkdirSync(wordsImagesDir, { recursive: true })

  // Response shape for file-based batch output isn't fully confirmed —
  // inspect `job` (via --status) if this doesn't match what comes back.
  const resultFileName = job.dest?.fileName ?? job.dest?.file
  if (!resultFileName) {
    throw new Error('Could not find a results file on the batch job — run --status and inspect job.dest')
  }

  const resultsPath = resolve(root, 'scripts/.batch-results.jsonl')
  await ai.files.download({ file: resultFileName, downloadPath: resultsPath })

  // The full results file (many base64-encoded images concatenated as JSON
  // lines) can exceed Node's max string length, so read it line-by-line
  // instead of loading it into memory as a single string.
  const lineReader = createInterface({
    input: createReadStream(resultsPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  let written = 0
  let errors = 0
  for await (const line of lineReader) {
    if (!line.trim()) continue
    const { key, response } = JSON.parse(line)
    const destPath = resolve(wordsImagesDir, `${key}.png`)
    if (existsSync(destPath)) {
      console.log(`  skip   ${key}`)
      continue
    }
    try {
      const imagePart = response.candidates[0].content.parts.find((p) => p.inlineData)
      if (!imagePart) throw new Error('no image in response')
      writeFileSync(destPath, Buffer.from(imagePart.inlineData.data, 'base64'))
      written++
      console.log(`  wrote  ${key}`)
    } catch (err) {
      errors++
      console.error(`  ERROR  ${key}: ${err.message}`)
    }
  }
  console.log(`\nWrote ${written} image(s), ${errors} error(s).`)
}

// --- Main ---

async function main() {
  if (has('--anchors')) return generateAnchors()
  if (has('--submit')) return submitBatch()
  if (has('--status')) return checkStatus()
  if (has('--fetch')) return fetchResults()

  console.log('Usage:')
  console.log('  npm run generate:images:gemini -- --anchors               generate style-anchor images')
  console.log('  npm run generate:images:gemini -- --submit [--limit N]    submit the batch job')
  console.log('  npm run generate:images:gemini -- --status                check job status')
  console.log('  npm run generate:images:gemini -- --fetch                 download results once succeeded')
  console.log('  add --dry-run to --anchors or --submit to preview without calling the API')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
