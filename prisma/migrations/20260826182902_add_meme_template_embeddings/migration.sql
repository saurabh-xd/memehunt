CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "MemeTemplate"
  ADD COLUMN "embedding" vector(768),
  ADD COLUMN "embeddingVersion" TEXT,
  ADD COLUMN "embeddedAt" TIMESTAMP(3);
