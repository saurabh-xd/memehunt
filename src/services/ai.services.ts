import { google } from "@/lib/ai"
import { generateObject } from "ai"
import { z } from "zod"

export async function chooseMeme(
  situation: string,
  memeList: string
) {

  const result = await generateObject({
    model: google("gemini-2.5-flash"),

    schema: z.object({
      template: z.string()
    }),

   prompt: `
You are an expert internet meme expert.

Your job is to select the most appropriate meme template.

The user may either:
1) Describe a situation
2) Ask directly for a type of meme (example: "confused meme", "crying meme")

User request:
${situation}

Below is a list of meme templates and their meanings.

Memes:
${memeList}

Instructions:

1. Understand what the user wants.
   - If the user describes a situation, determine the emotion or scenario.
   - If the user directly asks for a type of meme (confused, crying, angry, success, etc),
     find the meme template that best represents that emotion.

2. Compare the user request with the meanings of the memes.

3. Choose the meme whose meaning best matches the request.

4. ONLY choose from the provided meme IDs.

5. Do NOT invent new meme names.

Return ONLY the template ID.
`
  })

  return result.object.template
}