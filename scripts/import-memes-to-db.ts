import "dotenv/config"
import path from "node:path"
import { pathToFileURL } from "node:url"
import prisma from "../src/lib/prisma"
import type { MemeResult } from "../src/types/meme"

const datasetPath = path.join(process.cwd(), "src", "data", "meme.ts")

function buildTags(meme: MemeResult) {
  const tags = new Set<string>()

  if (meme.selectionEnabled === false) {
    tags.add("disabled")
  }

  const text = [meme.name, meme.description, meme.selectionNotes ?? ""]
    .join(" ")
    .toLowerCase()

  const keywordMap: Array<[string, string[]]> = [
    ["comparison", ["compare", "comparison", "versus", "vs", "choice", "option"]],
    ["reaction", ["reaction", "react", "response"]],
    ["chaos", ["chaos", "panic", "disaster", "wrong"]],
    ["sad", ["sad", "pain", "suffer", "heartbreak", "lonely"]],
    ["funny", ["funny", "ridiculous", "absurd", "silly"]],
    ["work", ["office", "workplace", "meeting", "work"]],
    ["study", ["study", "exam", "school"]],
    ["indian", ["indian", "desi", "modi", "salman", "virat", "parents"]],
    ["sarcasm", ["sarcastic", "sarcasm", "mocking"]],
    ["drama", ["dramatic", "drama", "emotional"]],
  ]

  for (const [tag, keywords] of keywordMap) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      tags.add(tag)
    }
  }

  return Array.from(tags).sort((left, right) => left.localeCompare(right))
}

async function main() {
  const datasetModule = await import(pathToFileURL(datasetPath).href)
  const memes: MemeResult[] = Array.isArray(datasetModule.memes) ? datasetModule.memes : []

  if (memes.length === 0) {
    console.log("No memes found in src/data/meme.ts")
    return
  }

  let importedCount = 0

  for (const meme of memes) {
    await prisma.memeTemplate.upsert({
      where: { id: meme.id },
      update: {
        name: meme.name,
        imageUrl: meme.image,
        description: meme.description,
        selectionNotes: meme.selectionNotes ?? null,
        selectionEnabled: meme.selectionEnabled ?? true,
        tags: buildTags(meme),
      },
      create: {
        id: meme.id,
        name: meme.name,
        imageUrl: meme.image,
        description: meme.description,
        selectionNotes: meme.selectionNotes ?? null,
        selectionEnabled: meme.selectionEnabled ?? true,
        tags: buildTags(meme),
      },
    })

    importedCount += 1
  }

  console.log(`Imported ${importedCount} meme template(s) into MemeTemplate.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
