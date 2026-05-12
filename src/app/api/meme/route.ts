import { z } from "zod"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { findBestMeme } from "@/services/meme.service"
import { MemeApiErrorResponse, MemeGenerateRequest } from "@/types/api"

const FREE_GENERATION_LIMIT = 2
const GUEST_USAGE_COOKIE = "memehunt-free-generations-used"
const GUEST_USAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

const memeRequestSchema = z.object({
  situation: z.string().trim().min(1, "Situation required"),
}) satisfies z.ZodType<MemeGenerateRequest>

function getGuestUsageCount(req: Request) {
  const rawUsageCount = req.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${GUEST_USAGE_COOKIE}=`))
    ?.split("=")[1]
  const usageCount = Number(rawUsageCount ?? 0)

  return Number.isFinite(usageCount) ? usageCount : 0
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })
    const guestUsageCount = getGuestUsageCount(req)

    if (!session?.user && guestUsageCount >= FREE_GENERATION_LIMIT) {
      return Response.json(
        {
          error: `You have used all ${FREE_GENERATION_LIMIT} free AI generations. Sign in with Google to continue creating memes.`,
        } satisfies MemeApiErrorResponse,
        { status: 403 }
      )
    }

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

    const response = NextResponse.json(meme)

    if (!session?.user) {
      response.cookies.set(GUEST_USAGE_COOKIE, String(guestUsageCount + 1), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: GUEST_USAGE_COOKIE_MAX_AGE,
        path: "/",
      })
    }

    return response
  } catch (error) {
    console.error("Failed to generate meme template", error)

    return Response.json(
      { error: "Unable to generate meme template" } satisfies MemeApiErrorResponse,
      { status: 500 }
    )
  }
}
