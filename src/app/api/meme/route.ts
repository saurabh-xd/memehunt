import { z } from "zod"
import { findBestMeme } from "@/services/meme.service"
import {
  MemeApiErrorResponse,
  MemeGenerateRequest,
  MemeGenerateResponse,
} from "@/types/api"

const memeRequestSchema = z.object({
  situation: z.string().trim().min(1, "Situation required"),
}) satisfies z.ZodType<MemeGenerateRequest>

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as MemeGenerateRequest
    const parsed = memeRequestSchema.safeParse(body) // check matches zod schema

    if (!parsed.success) {
      return Response.json(
        {
          error: parsed.error.issues[0]?.message ?? "Situation required",
        } satisfies MemeApiErrorResponse,
        { status: 400 }
      )
    }

    const situation = parsed.data.situation
    const meme = await findBestMeme(situation)

    return Response.json<MemeGenerateResponse>(meme)
  } catch (error) {
    console.error("Failed to generate meme template", error)

    return Response.json(
      { error: "Unable to generate meme template" } satisfies MemeApiErrorResponse,
      { status: 500 }
    )
  }
}
