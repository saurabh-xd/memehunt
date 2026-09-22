import { getSelectableMemeTemplates } from "@/lib/meme-template"
import type { MemeResult } from "@/types/meme"
import { MEME_SELECTION_PROMPT_VERSION, chooseMemes } from "./ai.services"
import { findRelevantMemeTemplates } from "./rag/meme-retrieval.service"

const MIN_AI_CONFIDENCE = 0.55
const DEFAULT_TARGET_MEMES_COUNT = 3

function pickDistinctRandomMemes(candidates: MemeResult[], count: number): MemeResult[] {
  if (candidates.length === 0) {
    throw new Error("No meme templates are available.")
  }

  const shuffled = [...candidates].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, candidates.length))
}

export async function findBestMemes(
  situation: string,
  targetCount = DEFAULT_TARGET_MEMES_COUNT
): Promise<MemeResult[]> {
  const allCandidates = await getSelectableMemeTemplates()
  const fallbackMemes = pickDistinctRandomMemes(allCandidates, targetCount)

  if (!situation.trim()) {
    return fallbackMemes
  }

  let candidates = allCandidates
  let retrievedCandidates: MemeResult[] = []

  try {
    retrievedCandidates = await findRelevantMemeTemplates(situation)
    if (retrievedCandidates.length > 0) {
      candidates = retrievedCandidates
    }
  } catch (error) {
    console.error("Failed to retrieve relevant meme templates", error)
  }

  const selectedMemes: MemeResult[] = []
  const seenIds = new Set<string>()

  function addMeme(meme: MemeResult | undefined) {
    if (meme && !seenIds.has(meme.id)) {
      seenIds.add(meme.id)
      selectedMemes.push(meme)
    }
  }

  try {
    const selection = await chooseMemes(situation, candidates)

    if (selection.confidence < MIN_AI_CONFIDENCE) {
      console.info("Meme selection had lower AI confidence, combining with RAG similarity", {
        situation,
        templates: selection.templates,
        confidence: selection.confidence,
        promptVersion: MEME_SELECTION_PROMPT_VERSION,
      })
      // If AI confidence is low, prioritize the top pgvector semantic similarity template
      if (retrievedCandidates.length > 0) {
        addMeme(retrievedCandidates[0])
      }
    }

    // Add templates selected by AI in order of ranking
    for (const templateId of selection.templates) {
      const matched =
        candidates.find((m) => m.id === templateId) ??
        allCandidates.find((m) => m.id === templateId)
      addMeme(matched)
    }
  } catch (error) {
    console.error("Failed to choose memes with AI", error)
  }

  // Backfill from RAG candidates (ordered by cosine similarity)
  for (const candidate of retrievedCandidates) {
    if (selectedMemes.length >= targetCount) break
    addMeme(candidate)
  }

  // Backfill from all available candidates if still needed
  for (const candidate of allCandidates) {
    if (selectedMemes.length >= targetCount) break
    addMeme(candidate)
  }

  return selectedMemes.length > 0 ? selectedMemes : fallbackMemes
}

export async function findBestMeme(situation: string): Promise<MemeResult> {
  const memes = await findBestMemes(situation, 1)
  return memes[0]
}

