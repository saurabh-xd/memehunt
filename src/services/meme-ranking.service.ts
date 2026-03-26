import { memes } from "@/data/meme"
import { MemeResult } from "@/types/meme"

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
  "with",
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
    .filter((token) => token.length > 1 && !stopWords.has(token))
}

function uniqueTokens(values: string[]) {
  return Array.from(new Set(values.flatMap(tokenize)))
}

export function getEnabledMemes() {
  return memes.filter((meme) => meme.selectionEnabled !== false)
}

function getDirectValues(meme: MemeResult) {
  return [meme.id, meme.name].map(normalizeText)
}

function findDirectMatch(situation: string, candidates: MemeResult[]) {
  const normalizedSituation = normalizeText(situation)

  return candidates.find((meme) =>
    getDirectValues(meme).some(
      (value) =>
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
    meme.selectionNotes ?? "",
  ])

  let score = 0

  for (const value of getDirectValues(meme)) {
    if (!value) continue

    if (normalizedSituation === value) score += 40
    else if (normalizedSituation.includes(value)) score += 20
  }

  for (const token of situationTokens) {
    if (tokenFields.includes(token)) {
      score += 2
    }
  }

  if (
    tokenize([meme.description, meme.selectionNotes ?? ""].join(" "))
      .some((token) => situationTokens.includes(token))
  ) {
    score += 4
  }

  return score
}

export function buildMemeSelectionContext(situation: string) {
  const candidates = getEnabledMemes()  //all memes
  const directMatch = findDirectMatch(situation, candidates)

  if (directMatch) {
    const shortlist = [
      directMatch,
      ...candidates.filter((meme) => meme.id !== directMatch.id),
    ].slice(0, SHORTLIST_SIZE)

    return {
      shortlist,
      fallback: directMatch,
      directMatch,
    }
  }

  const ranked = candidates
    .map((meme) => ({
      meme,
      score: scoreCandidate(situation, meme),
    }))
    .sort((left, right) => right.score - left.score)

  const shortlist = ranked
    .slice(0, SHORTLIST_SIZE)
    .map((entry) => entry.meme)

  const fallback = shortlist[0] ?? candidates[0] ?? memes[0]

  return {
    shortlist: shortlist.length > 0 ? shortlist : candidates.slice(0, SHORTLIST_SIZE),
    fallback,
    directMatch: null,
  }
}
