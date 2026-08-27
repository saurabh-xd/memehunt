import { getSelectableMemeTemplates } from "@/lib/meme-template"
import type { MemeResult } from "@/types/meme"
import { MEME_SELECTION_PROMPT_VERSION, chooseMeme } from "./ai.services"
import { findRelevantMemeTemplates } from "./meme-retrieval.service"

const MIN_AI_CONFIDENCE = 0.55

function pickRandomMeme(candidates: MemeResult[]) {
  if (candidates.length === 0) {
    throw new Error("No meme templates are available.")
  }

  const randomIndex = Math.floor(Math.random() * candidates.length)
  return candidates[randomIndex]
}

export async function findBestMeme(situation: string) {
  const allCandidates = await getSelectableMemeTemplates()
  const fallback = pickRandomMeme(allCandidates)

  if (!situation) {
    return fallback
  }

  let candidates = allCandidates

  try {
    const retrievedCandidates = await findRelevantMemeTemplates(situation)
    if (retrievedCandidates.length > 0) {
      candidates = retrievedCandidates
    }
  } catch (error) {
    console.error("Failed to retrieve relevant meme templates", error)
  }

  try {
    const selection = await chooseMeme(situation, candidates)
    const selectedMeme = candidates.find((meme) => meme.id === selection.template)

    if (!selectedMeme) {
      console.info("Meme selection fell back: AI returned unknown template", {
        situation: situation,
        template: selection.template,
        promptVersion: MEME_SELECTION_PROMPT_VERSION,
      })

      return fallback
    }

  
    

    if (selection.confidence < MIN_AI_CONFIDENCE) {
      console.info("Meme selection fell back: low AI confidence", {
        situation: situation,
        template: selection.template,
        confidence: selection.confidence,
        promptVersion: MEME_SELECTION_PROMPT_VERSION,
      })

      return fallback
    }

    return selectedMeme
  } catch (error) {
    console.error("Failed to choose meme with AI", error)

    return fallback
  }
}
