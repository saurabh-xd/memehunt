import "dotenv/config"
import prisma from "../src/lib/prisma"
import {
  createDocumentEmbeddings,
  EMBEDDING_MODEL_VERSION,
  getTemplateEmbeddingText,
} from "../src/services/rag/meme-embedding"

const BATCH_SIZE = 20

async function main() {
  const templates = await prisma.memeTemplate.findMany({
    where: {
      OR: [
        { embeddingVersion: null },
        { embeddingVersion: { not: EMBEDDING_MODEL_VERSION } },
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      selectionNotes: true,
      tags: true,
    },
    orderBy: { name: "asc" },
  })

  if (templates.length === 0) {
    console.log("All meme templates already have current embeddings.")
    return
  }

  console.log(`Embedding ${templates.length} meme template(s)...`)

  for (let start = 0; start < templates.length; start += BATCH_SIZE) {
    const batch = templates.slice(start, start + BATCH_SIZE)
    const embeddings = await createDocumentEmbeddings(
      batch.map(getTemplateEmbeddingText)
    )

    // Individual writes avoid Prisma's short interactive-transaction timeout
    // on serverless Postgres. The version check makes a partial run resumable.
    for (const [index, template] of batch.entries()) {
      const vector = `[${embeddings[index].join(",")}]`

      await prisma.$executeRaw`
        UPDATE "MemeTemplate"
        SET
          "embedding" = ${vector}::vector,
          "embeddingVersion" = ${EMBEDDING_MODEL_VERSION},
          "embeddedAt" = NOW()
        WHERE "id" = ${template.id}
      `
    }

    console.log(`Embedded ${Math.min(start + BATCH_SIZE, templates.length)} of ${templates.length}`)
  }
}

main()
  .catch((error) => {
    console.error("Failed to embed meme templates", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
