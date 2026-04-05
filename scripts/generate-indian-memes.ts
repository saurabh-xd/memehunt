import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

type MemeRecord = Record<string, unknown> & {
  id?: string
  name?: string
  image?: string
  description?: string
}

const memesDir = path.join(process.cwd(), "public", "memes", "indian")
const datasetPath = path.join(process.cwd(), "src", "data", "meme.ts")

function toSlug(fileName: string) {
  return fileName
    .replace(path.extname(fileName), "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function toTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatValue(value: unknown, indentLevel: number): string {
  const indent = "  ".repeat(indentLevel)
  const nextIndent = "  ".repeat(indentLevel + 1)

  if (typeof value === "string") {
    return JSON.stringify(value)
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (value === null) {
    return "null"
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]"
    return `[${value.map((item) => formatValue(item, indentLevel)).join(", ")}]`
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return "{}"

    return `{\n${entries
      .map(([key, entryValue]) => `${nextIndent}${key}: ${formatValue(entryValue, indentLevel + 1)}`)
      .join(",\n")}\n${indent}}`
  }

  return "undefined"
}

function formatMeme(record: MemeRecord) {
  const orderedRecord: MemeRecord = {
    id: record.id,
    name: record.name,
    image: record.image,
    description: record.description ?? "",
  }

  for (const [key, value] of Object.entries(record)) {
    if (key in orderedRecord) continue
    orderedRecord[key] = value
  }

  return `  ${formatValue(orderedRecord, 1)}`
}

function stripPrimaryFields(record: MemeRecord) {
  const rest = { ...record }
  delete rest.id
  delete rest.name
  delete rest.image
  delete rest.description
  return rest
}

async function main() {
  if (!fs.existsSync(memesDir)) {
    console.error(`Folder not found: ${memesDir}`)
    process.exit(1)
  }

  if (!fs.existsSync(datasetPath)) {
    console.error(`Dataset not found: ${datasetPath}`)
    process.exit(1)
  }

  const datasetModule = await import(pathToFileURL(datasetPath).href)
  const existingMemes: MemeRecord[] = Array.isArray(datasetModule.memes) ? datasetModule.memes : []

  const existingIndianByImage = new Map(
    existingMemes
      .filter((meme) => typeof meme.image === "string" && meme.image.startsWith("/memes/indian/"))
      .map((meme) => [meme.image as string, meme])
  )

  const nonIndianMemes = existingMemes.filter(
    (meme) => !(typeof meme.image === "string" && meme.image.startsWith("/memes/indian/"))
  )

  const files = fs
    .readdirSync(memesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))

  const generatedIndianMemes = files.map((fileName) => {
    const slug = toSlug(fileName)
    const title = toTitle(slug)
    const image = `/memes/indian/${fileName}`
    const existing = existingIndianByImage.get(image)

    return {
      id: existing?.id ?? slug,
      name: existing?.name ?? title,
      image,
      description: existing?.description ?? "",
      ...stripPrimaryFields(existing ?? {}),
    }
  })

  const nextDataset = `import { MemeResult } from "@/types/meme"\n\nexport const memes: MemeResult[] = [\n${[
    ...nonIndianMemes,
    ...generatedIndianMemes,
  ]
    .map(formatMeme)
    .join(",\n\n")}\n]\n`

  fs.writeFileSync(datasetPath, nextDataset, "utf8")

  console.log(
    `Updated ${path.relative(process.cwd(), datasetPath)} with ${generatedIndianMemes.length} Indian meme entries.`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
