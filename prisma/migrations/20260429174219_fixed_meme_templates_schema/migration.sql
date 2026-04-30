-- AlterTable
ALTER TABLE "MemeTemplate" ALTER COLUMN "selectionEnabled" SET DEFAULT true,
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX "MemeTemplate_selectionEnabled_idx" ON "MemeTemplate"("selectionEnabled");
