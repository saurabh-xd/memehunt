import prisma from "@/lib/prisma"
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

  return memeTemplates.map(toMemeResult)
}

export async function getSelectableMemeTemplates() {
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

  return memeTemplates.map(toMemeResult)
}
