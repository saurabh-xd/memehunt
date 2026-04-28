import "dotenv/config"
import fs from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"
import cloudinary, { hasCloudinaryEnv } from "../src/lib/cloudinary"

type MemeRecord = Record<string, unknown> & {
  id?: string
  name?: string
  image?: string
  description?: string
}

const datasetPath = path.join(process.cwd(), "src", "data", "meme.ts")
const backupDir = path.join(process.cwd(), "src", "data", "backups")
const cloudinaryFolder = "memehunt/memes"
const supportedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"])

function printUsage() {
  console.log(
    'Usage: npm run add-memes -- "<local-folder>"\nExample: npm run add-memes -- "staging/memes"'
  )
}

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

function sanitizePublicId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "")
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
  return `  ${formatValue(record, 1)}`
}

function createDatasetSource(memes: MemeRecord[]) {
  return `import { MemeResult } from "@/types/meme"\n\nexport const memes: MemeResult[] = [\n${memes
    .map(formatMeme)
    .join(",\n\n")}\n]\n`
}

function getImageFiles(directory: string) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && supportedExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))
}

async function main() {
  const sourceFolderArg = process.argv[2]

  if (!sourceFolderArg) {
    printUsage()
    process.exit(1)
  }

  if (!hasCloudinaryEnv()) {
    console.error("Missing Cloudinary environment variables. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.")
    process.exit(1)
  }

  const sourceFolder = path.resolve(process.cwd(), sourceFolderArg)

  if (!fs.existsSync(sourceFolder)) {
    console.error(`Folder not found: ${sourceFolder}`)
    process.exit(1)
  }

  if (!fs.existsSync(datasetPath)) {
    console.error(`Dataset not found: ${datasetPath}`)
    process.exit(1)
  }

  const files = getImageFiles(sourceFolder)

  if (files.length === 0) {
    console.log(`No image files found in ${sourceFolder}`)
    return
  }

  const datasetModule = await import(pathToFileURL(datasetPath).href)
  const existingMemes: MemeRecord[] = Array.isArray(datasetModule.memes) ? datasetModule.memes : []
  const memesById = new Map(existingMemes.map((meme) => [meme.id, meme]))

  fs.mkdirSync(backupDir, { recursive: true })
  const backupPath = path.join(
    backupDir,
    `meme.${new Date().toISOString().replace(/[:.]/g, "-")}.backup.ts`
  )
  fs.copyFileSync(datasetPath, backupPath)

  for (const fileName of files) {
    const slug = toSlug(fileName)
    const title = toTitle(slug)
    const filePath = path.join(sourceFolder, fileName)
    const publicId = sanitizePublicId(slug)

    console.log(`Uploading ${fileName} -> ${cloudinaryFolder}/${publicId}`)

    const result = await cloudinary.uploader.upload(filePath, {
      folder: cloudinaryFolder,
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
    })

    const existing = memesById.get(slug)

    memesById.set(slug, {
      id: existing?.id ?? slug,
      name: existing?.name ?? title,
      description: existing?.description ?? "",
      ...existing,
      image: result.secure_url,
    })
  }

  const nextDataset = createDatasetSource(
    Array.from(memesById.values()).sort((left, right) =>
      String(left.id ?? "").localeCompare(String(right.id ?? ""))
    )
  )

  fs.writeFileSync(datasetPath, nextDataset, "utf8")

  console.log(`\nBacked up original dataset to ${path.relative(process.cwd(), backupPath)}`)
  console.log(`Updated ${path.relative(process.cwd(), datasetPath)} with ${files.length} uploaded meme image(s).`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
