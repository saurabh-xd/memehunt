import { findBestMeme } from "@/services/meme.service"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const situation = typeof body?.situation === "string"
      ? body.situation.trim()
      : ""

    if (!situation) {
      return Response.json(
        { error: "Situation required" },
        { status: 400 }
      )
    }

    const meme = await findBestMeme(situation)

    return Response.json(meme)
  } catch (error) {
    console.error("Failed to generate meme template", error)

    return Response.json(
      { error: "Unable to generate meme template" },
      { status: 500 }
    )
  }
}
