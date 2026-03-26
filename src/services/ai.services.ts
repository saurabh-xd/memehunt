import { generateObject } from "ai"
import { z } from "zod"
import { google } from "@/lib/ai"
import { MemeResult } from "@/types/meme"

export const MEME_SELECTION_PROMPT_VERSION = "v1"

const memeSelectionSchema = z.object({
  template: z.string(),
  confidence: z.number().min(0).max(1),
  reason: z.string()
})

export type MemeSelection = z.infer<typeof memeSelectionSchema>

function formatCandidate(meme: MemeResult) {
  return [
    `id: ${meme.id}`,
    `name: ${meme.name}`,
    `description: ${meme.description}`,
    `best_fit: ${meme.selectionNotes ?? ""}`,
  ].join("\n")
}

export async function chooseMeme(
  situation: string,
  candidates: MemeResult[]
) {
  const candidateIds = candidates.map((meme) => meme.id).join(", ")
  const candidateList = candidates
    .map(formatCandidate)
    .join("\n\n")

  const result = await generateObject({
    model: google("gemini-2.5-flash"),
    schema: memeSelectionSchema,
    temperature: 0.2,
    prompt: `
You are an expert meme template selector. Prompt version: ${MEME_SELECTION_PROMPT_VERSION}.

Your task is to choose the best meme template for the user's situation from the provided shortlist.

Selection rules:
1. Pick exactly one template from the provided IDs.
2. Prefer semantic fit over shallow keyword overlap.
3. If the user explicitly names a meme style, prioritize that if it exists in the shortlist.
4. Use the description and best_fit notes together.
5. Keep confidence high only when the fit is clearly strong.

User request:
${situation}

Allowed template IDs:
${candidateIds}

Candidate memes:
${candidateList}

Return JSON with:
- template: selected meme id
- confidence: number from 0 to 1
- reason: short explanation
`
  })

  return result.object
}
