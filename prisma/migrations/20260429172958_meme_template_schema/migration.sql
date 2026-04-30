-- CreateTable
CREATE TABLE "MemeTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "selectionNotes" TEXT,
    "selectionEnabled" BOOLEAN NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemeTemplate_pkey" PRIMARY KEY ("id")
);
