import prisma from "@/lib/prisma"
import type { MemeResult } from "@/types/meme"
import { createQueryEmbedding } from "./meme-embedding"


const DEFAULT_CANDIDATE_LIMIT = 12

type RetrievedMemeTemplate = {
  id: string
  name: string
  imageUrl: string
  description: string
  selectionNotes: string | null
  selectionEnabled: boolean
  similarity: number
}

function toMemeResult(template: RetrievedMemeTemplate): MemeResult {
  return {
    id: template.id,
    name: template.name,
    image: template.imageUrl,
    description: template.description,
    selectionNotes: template.selectionNotes ?? undefined,
    selectionEnabled: template.selectionEnabled,
  }
}

/**
 * Retrieves semantically similar templates from pgvector. The returned list is
 * intentionally small so the language model can make the final humour/context
 * judgement without receiving the entire template catalogue.
 */
export async function findRelevantMemeTemplates(
  situation: string,
  limit = DEFAULT_CANDIDATE_LIMIT
) {
  const embedding = await createQueryEmbedding(situation)
  const vector = `[${embedding.join(",")}]`

  const rows = await prisma.$queryRaw<RetrievedMemeTemplate[]>`
    SELECT
      "id",
      "name",
      "imageUrl",
      "description",
      "selectionNotes",
      "selectionEnabled",
      1 - ("embedding" <=> ${vector}::vector) AS "similarity"
    FROM "MemeTemplate"
    WHERE "selectionEnabled" = true
      AND "embedding" IS NOT NULL
    ORDER BY "embedding" <=> ${vector}::vector
    LIMIT ${limit}
  `

  return rows.map(toMemeResult)
}
