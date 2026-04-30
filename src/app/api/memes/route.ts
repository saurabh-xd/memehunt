import { getAllMemeTemplates } from "@/lib/meme-template"
import type { MemeTemplatesResponse } from "@/types/api"

export async function GET() {
  try {
    const memes = await getAllMemeTemplates()

    return Response.json(memes satisfies MemeTemplatesResponse)
  } catch (error) {
    console.error("Failed to load meme templates", error)

    return Response.json(
      { error: "Unable to load meme templates" },
      { status: 500 }
    )
  }
}
