import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  createEmbedding,
  EMBEDDING_MODEL_VERSION,
  getTemplateEmbeddingText,
} from "./rag/meme-embedding";

async function refreshMemeTemplateEmbedding(id: string) {
  try {
    const template = await prisma.memeTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        selectionNotes: true,
        tags: true,
      },
    });

    if (!template) return;

    const embedding = await createEmbedding(
      getTemplateEmbeddingText(template),
      "RETRIEVAL_DOCUMENT"
    );
    const vector = `[${embedding.join(",")}]`;

    await prisma.$executeRaw`
      UPDATE "MemeTemplate"
      SET
        "embedding" = ${vector}::vector,
        "embeddingVersion" = ${EMBEDDING_MODEL_VERSION},
        "embeddedAt" = NOW()
      WHERE "id" = ${id}
    `;
  } catch (error) {
    // Template management remains available if the embedding provider is down.
    // `npm run embed-meme-templates` will retry this template later.
    console.error(`Failed to refresh embedding for meme template ${id}`, error);
  }
}

export async function createMemeTemplate(data: Prisma.MemeTemplateCreateInput) {
  const template = await prisma.memeTemplate.create({ data });
  await refreshMemeTemplateEmbedding(template.id);
  return template;
}

export async function createMemeTemplates(
  data: Prisma.MemeTemplateCreateManyInput[],
) {
  const result = await prisma.memeTemplate.createMany({ data, skipDuplicates: true });

  for (const template of data) {
    await refreshMemeTemplateEmbedding(template.id);
  }

  return result;
}

export async function updateMemeTemplate(
  id: string,
  data: Prisma.MemeTemplateUpdateInput,
) {
  const template = await prisma.memeTemplate.update({
    where: { id },
    data,
  });
  await refreshMemeTemplateEmbedding(id);
  return template;
}

export async function deleteMemeTemplate(id: string) {
  return prisma.memeTemplate.delete({
    where: { id },
  });
}

export async function toggleMemeSelection(id: string, enabled: boolean) {
  return prisma.memeTemplate.update({
    where: { id },
    data: { selectionEnabled: enabled },
  });
}
