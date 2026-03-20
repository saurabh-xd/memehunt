import { memes } from "@/data/meme"
import { MemeResult } from "@/types/meme"
import { chooseMeme } from "./ai.services"

const MIN_AI_CONFIDENCE = 0.55
const SHORTLIST_SIZE = 6

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "so",
  "that",
  "the",
  "to",
  "was",
  "when",
  "with"
])

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter(token => token.length > 1 && !stopWords.has(token))
}

function uniqueTokens(values: string[]) {
  return Array.from(new Set(values.flatMap(tokenize)))
}

function getEnabledMemes() {
  return memes.filter(meme => meme.selectionEnabled !== false)
}

function getDirectValues(meme: MemeResult) {
  return [meme.id, meme.name, ...meme.aliases].map(normalizeText)
}

function findDirectMatch(situation: string, candidates: MemeResult[]) {
  const normalizedSituation = normalizeText(situation)

  return candidates.find((meme) =>
    getDirectValues(meme).some(value =>
      value.length > 0 &&
      (normalizedSituation === value || normalizedSituation.includes(value))
    )
  )
}

function scoreCandidate(situation: string, meme: MemeResult) {
  const normalizedSituation = normalizeText(situation)
  const situationTokens = tokenize(situation)
  const tokenFields = uniqueTokens([
    meme.id,
    meme.name,
    meme.description,
    ...meme.aliases,
    ...meme.keywords,
    ...meme.emotions,
    ...meme.scenarios
  ])

  let score = 0

  for (const value of getDirectValues(meme)) {
    if (!value) continue

    if (normalizedSituation === value) score += 40
    else if (normalizedSituation.includes(value)) score += 20
  }

  for (const phrase of [...meme.keywords, ...meme.emotions, ...meme.scenarios]) {
    const normalizedPhrase = normalizeText(phrase)

    if (normalizedPhrase && normalizedSituation.includes(normalizedPhrase)) {
      score += normalizedPhrase.includes(" ") ? 8 : 5
    }
  }

  for (const token of situationTokens) {
    if (tokenFields.includes(token)) {
      score += 2
    }
  }

  if (tokenize(meme.description).some(token => situationTokens.includes(token))) {
    score += 4
  }

  return score
}

function getShortlist(situation: string) {
  const candidates = getEnabledMemes()
  const directMatch = findDirectMatch(situation, candidates)

  if (directMatch) {
    const shortlist = [
      directMatch,
      ...candidates.filter(meme => meme.id !== directMatch.id)
    ].slice(0, SHORTLIST_SIZE)

    return { directMatch, shortlist }
  }

  const ranked = candidates
    .map(meme => ({
      meme,
      score: scoreCandidate(situation, meme)
    }))
    .sort((left, right) => right.score - left.score)

  const shortlist = ranked
    .slice(0, SHORTLIST_SIZE)
    .map(entry => entry.meme)

  return {
    directMatch: null,
    shortlist: shortlist.length > 0 ? shortlist : candidates.slice(0, SHORTLIST_SIZE)
  }
}

export async function findBestMeme(situation: string) {
  const normalizedSituation = situation.trim()
  const enabledMemes = getEnabledMemes()
  const { directMatch, shortlist } = getShortlist(normalizedSituation)
  const fallback = directMatch ?? shortlist[0] ?? enabledMemes[0] ?? memes[0]

  if (!normalizedSituation) {
    return fallback
  }

  try {
    const selection = await chooseMeme(normalizedSituation, shortlist)
    const selectedMeme = shortlist.find(meme => meme.id === selection.template)

    if (!selectedMeme || selection.confidence < MIN_AI_CONFIDENCE) {
      return fallback
    }

    return selectedMeme
  } catch (error) {
    console.error("Failed to choose meme with AI", error)
    return fallback
  }
}
