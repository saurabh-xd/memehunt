import prisma from "@/lib/prisma"
import { memes as staticMemes } from "@/data/meme"
import type { MemeResult } from "@/types/meme"

type MemeTemplateRecord = {
  id: string
  name: string
  imageUrl: string
  description: string
  selectionNotes: string | null
  selectionEnabled: boolean
}

function toMemeResult(record: MemeTemplateRecord): MemeResult {
  return {
    id: record.id,
    name: record.name,
    image: record.imageUrl,
    description: record.description,
    selectionNotes: record.selectionNotes ?? undefined,
    selectionEnabled: record.selectionEnabled,
  }
}

export async function getAllMemeTemplates() {
  try {
    const memeTemplates = await prisma.memeTemplate.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        description: true,
        selectionNotes: true,
        selectionEnabled: true,
      },
    })

    if (memeTemplates.length === 0) {
      return staticMemes
    }

    return memeTemplates.map(toMemeResult)
  } catch (error) {
    console.error("Failed to load meme templates from database, falling back to static dataset", error)
    return staticMemes
  }
}

export async function getSelectableMemeTemplates() {
  try {
    const memeTemplates = await prisma.memeTemplate.findMany({
      where: { selectionEnabled: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        description: true,
        selectionNotes: true,
        selectionEnabled: true,
      },
    })

    if (memeTemplates.length === 0) {
      return staticMemes.filter((meme) => meme.selectionEnabled !== false)
    }

    return memeTemplates.map(toMemeResult)
  } catch (error) {
    console.error(
      "Failed to load selectable meme templates from database, falling back to static dataset",
      error
    )
    return staticMemes.filter((meme) => meme.selectionEnabled !== false)
  }
}
