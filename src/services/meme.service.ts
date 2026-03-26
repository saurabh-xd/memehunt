import { MEME_SELECTION_PROMPT_VERSION, chooseMeme } from "./ai.services"
import { buildMemeSelectionContext } from "./meme-ranking.service"

const MIN_AI_CONFIDENCE = 0.55

export async function findBestMeme(situation: string) {
  const normalizedSituation = situation.trim()
  const { shortlist, fallback } = buildMemeSelectionContext(normalizedSituation)

  if (!normalizedSituation) {
    return fallback
  }

  try {
    const selection = await chooseMeme(normalizedSituation, shortlist)
    const selectedMeme = shortlist.find((meme) => meme.id === selection.template)

    if (!selectedMeme) {
      console.info("Meme selection fell back: AI returned unknown template", {
        situation: normalizedSituation,
        template: selection.template,
        promptVersion: MEME_SELECTION_PROMPT_VERSION,
      })

      return fallback
    }

    if (selection.confidence < MIN_AI_CONFIDENCE) {
      console.info("Meme selection fell back: low AI confidence", {
        situation: normalizedSituation,
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
