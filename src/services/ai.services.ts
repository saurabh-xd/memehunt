import { generateObject } from "ai"
import { z } from "zod"
import { google, groq } from "@/lib/ai"
import { MemeResult } from "@/types/meme"

export const MEME_SELECTION_PROMPT_VERSION = "v2"

const memeSelectionSchema = z.object({
  templates: z.array(z.string()).min(1).max(3).describe("Ranked list of 3 best matching meme template IDs (best fit first, followed by 2 alternatives)"),
  template: z.string().optional().describe("Primary selected template ID"),
  confidence: z.number().min(0).max(1),
  reason: z.string(),
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

function buildSelectionPrompt(situation: string, candidates: MemeResult[]) {
  const candidateIds = candidates.map((meme) => meme.id).join(", ")
  const candidateList = candidates.map(formatCandidate).join("\n\n")

  return `
You are an expert meme template selector. Prompt version: ${MEME_SELECTION_PROMPT_VERSION}.

Your task is to choose the best meme template options for the user's situation from the provided candidate list.
Provide the top best match plus 2 distinct strong alternative options (total of 3 templates).

Selection rules:
1. Pick 3 distinct templates from the provided IDs, ranked from best match to good alternative matches (order: #1 best match, #2 alternative, #3 alternative).
2. If fewer than 3 candidates are available, return as many as possible.
3. Prefer semantic fit, relatable humor, and situational relevance over shallow keyword overlap.
4. If the user explicitly names a meme style, prioritize that template first.
5. Use the description and best_fit notes together.
6. Keep confidence high only when the top fit is clearly strong.

User request:
${situation}

Allowed template IDs:
${candidateIds}

Candidate memes:
${candidateList}

Return JSON with:
- templates: array of 3 to 4 selected meme template IDs in order of fit (best first)
- confidence: number from 0 to 1 for the top match
- reason: short explanation of why these meme templates fit
`
}

export async function chooseMemes(
  situation: string,
  candidates: MemeResult[]
): Promise<MemeSelection> {
  const prompt = buildSelectionPrompt(situation, candidates)
  const providers = [
    {
      name: "groq",
      model: groq("openai/gpt-oss-20b"),
    },
    {
      name: "gemini",
      model: google("gemini-2.5-flash"),
    },
  ] as const

  let lastError: unknown = null

  for (const provider of providers) {
    try {
      const result = await generateObject({
        model: provider.model,
        schema: memeSelectionSchema,
        temperature: 0.2,
        prompt,
      })

      const object = result.object
      // Normalize templates array if single template was provided
      if (!object.templates || object.templates.length === 0) {
        if (object.template) {
          object.templates = [object.template]
        }
      }

      return object
    } catch (error) {
      lastError = error
      console.warn(`Meme selection failed with ${provider.name}, trying next provider`, error)
    }
  }

  throw lastError
}

export async function chooseMeme(
  situation: string,
  candidates: MemeResult[]
): Promise<{ template: string; confidence: number; reason: string }> {
  const selection = await chooseMemes(situation, candidates)
  const primaryTemplate = selection.templates[0] ?? selection.template ?? ""
  return {
    template: primaryTemplate,
    confidence: selection.confidence,
    reason: selection.reason,
  }
}
