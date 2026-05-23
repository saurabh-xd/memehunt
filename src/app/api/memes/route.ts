import { getMemeTemplatesPage } from "@/lib/meme-template"
import type { MemeTemplatesResponse } from "@/types/api"

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 40

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? Math.floor(parsedValue)
    : fallback
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get("q") ?? ""
    const offset = parsePositiveInteger(url.searchParams.get("offset"), 0)
    const requestedLimit = parsePositiveInteger(url.searchParams.get("limit"), DEFAULT_LIMIT)
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT)
    const memes = await getMemeTemplatesPage({ query, offset, limit })

    return Response.json(memes satisfies MemeTemplatesResponse, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    })
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
