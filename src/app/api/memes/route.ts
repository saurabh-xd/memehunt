import { getAllMemeTemplates } from "@/lib/meme-template"
import type { MemeTemplatesResponse } from "@/types/api"

export async function GET() {
  try {
    const memes = await getAllMemeTemplates()

    return Response.json(memes satisfies MemeTemplatesResponse)
  } catch (error) {
    console.error("Failed to load meme templates", error)
    const isDatabaseConnectionError =
      error instanceof Error && error.message.includes("Can't reach database server")

    return Response.json(
      {
        error: isDatabaseConnectionError
          ? "Unable to reach the meme database. Check DATABASE_URL and Neon availability."
          : "Unable to load meme templates",
      },
      { status: isDatabaseConnectionError ? 503 : 500 }
    )
  }
}
