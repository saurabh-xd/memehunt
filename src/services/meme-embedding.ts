import { embed, embedMany } from "ai"
import { google } from "@/lib/ai"

export const EMBEDDING_MODEL_VERSION = "gemini-embedding-001-768-v1"
export const EMBEDDING_DIMENSIONS = 768

const embeddingModel = google.embedding("gemini-embedding-001")

type EmbeddingTask = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY"

function assertEmbeddingDimensions(vector: number[]) {
  if (vector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS} dimensions, received ${vector.length}`
    )
  }
}

export async function createEmbedding(
  text: string,
  taskType: EmbeddingTask
): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        taskType,
      },
    },
  })

  assertEmbeddingDimensions(embedding)
  return embedding
}

export async function createDocumentEmbeddings(texts: string[]) {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
    providerOptions: {
      google: {
        outputDimensionality: EMBEDDING_DIMENSIONS,
        taskType: "RETRIEVAL_DOCUMENT",
      },
    },
  })

  embeddings.forEach(assertEmbeddingDimensions)
  return embeddings
}

type EmbeddableTemplate = {
  name: string
  description: string
  selectionNotes: string | null
  tags: string[]
}

export function getTemplateEmbeddingText(template: EmbeddableTemplate) {
  return [
    `Meme template: ${template.name}`,
    `Meaning and use cases: ${template.description}`,
    `Best fit: ${template.selectionNotes ?? "Not provided"}`,
    `Tags: ${template.tags.join(", ") || "Not provided"}`,
  ].join("\n")
}

export async function createQueryEmbedding(text: string) {
  return createEmbedding(text, "RETRIEVAL_QUERY")
}
