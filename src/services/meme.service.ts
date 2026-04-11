import { memes } from "@/data/meme"
import { MEME_SELECTION_PROMPT_VERSION, chooseMeme } from "./ai.services"

const MIN_AI_CONFIDENCE = 0.55

function pickRandomMeme(candidates: typeof memes) {
  if (candidates.length === 0) return memes[0]

  const randomIndex = Math.floor(Math.random() * candidates.length)
  return candidates[randomIndex]
}

export async function findBestMeme(situation: string) {
  const candidates = memes.filter((meme) => meme.selectionEnabled !== false)
  const fallback = pickRandomMeme(candidates)

  if (!situation) {
    return fallback
  }

  try {
    const selection = await chooseMeme(situation, candidates)
    console.log("selection->",selection);
    
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
