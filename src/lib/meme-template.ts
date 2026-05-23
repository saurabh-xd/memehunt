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

type MemeTemplatePageOptions = {
  query?: string
  limit: number
  offset: number
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

export async function getMemeTemplatesPage({
  query = "",
  limit,
  offset,
}: MemeTemplatePageOptions) {
  const normalizedQuery = query.trim()
  const where = {
    selectionEnabled: true,
    ...(normalizedQuery
      ? {
          OR: [
            { id: { contains: normalizedQuery, mode: "insensitive" as const } },
            { name: { contains: normalizedQuery, mode: "insensitive" as const } },
            { description: { contains: normalizedQuery, mode: "insensitive" as const } },
            { selectionNotes: { contains: normalizedQuery, mode: "insensitive" as const } },
            { tags: { has: normalizedQuery.toLowerCase() } },
          ],
        }
      : {}),
  }

  const [total, memeTemplates] = await Promise.all([
    prisma.memeTemplate.count({ where }),
    prisma.memeTemplate.findMany({
      where,
      orderBy: { name: "asc" },
      skip: offset,
      take: limit,
      select: {
        id: true,
        name: true,
        imageUrl: true,
        description: true,
        selectionNotes: true,
        selectionEnabled: true,
      },
    }),
  ])

  return {
    items: memeTemplates.map(toMemeResult),
    nextOffset: offset + memeTemplates.length < total ? offset + memeTemplates.length : null,
    total,
  }
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
