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

function sanitizePublicId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "")
}

function getUploadSource(image: string) {
  if (image.startsWith("/")) {
    const localPath = path.join(process.cwd(), "public", image.replace(/^\/+/, ""))

    if (!fs.existsSync(localPath)) {
      throw new Error(`Local image not found: ${localPath}`)
    }

    return localPath
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image
  }

  throw new Error(`Unsupported image source: ${image}`)
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

async function main() {
  if (!hasCloudinaryEnv()) {
    console.error("Missing Cloudinary environment variables. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.")
    process.exit(1)
  }

  if (!fs.existsSync(datasetPath)) {
    console.error(`Dataset not found: ${datasetPath}`)
    process.exit(1)
  }

  const datasetModule = await import(pathToFileURL(datasetPath).href)
  const existingMemes: MemeRecord[] = Array.isArray(datasetModule.memes) ? datasetModule.memes : []

  if (existingMemes.length === 0) {
    console.log("No memes found in dataset.")
    return
  }

  const migratedMemes: MemeRecord[] = []

  for (const meme of existingMemes) {
    const image = typeof meme.image === "string" ? meme.image : null

    if (!image) {
      migratedMemes.push(meme)
      continue
    }

    if (image.includes("res.cloudinary.com")) {
      migratedMemes.push(meme)
      continue
    }

    const uploadSource = getUploadSource(image)
    const publicId = sanitizePublicId(meme.id ?? meme.name ?? `meme-${migratedMemes.length + 1}`)

    console.log(`Uploading ${meme.id ?? meme.name ?? image} -> ${cloudinaryFolder}/${publicId}`)

    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: cloudinaryFolder,
      public_id: publicId,
      overwrite: true,
      resource_type: "image",
    })

    migratedMemes.push({
      ...meme,
      image: result.secure_url,
    })
  }

  fs.mkdirSync(backupDir, { recursive: true })

  const backupPath = path.join(
    backupDir,
    `meme.${new Date().toISOString().replace(/[:.]/g, "-")}.backup.ts`
  )

  fs.copyFileSync(datasetPath, backupPath)
  fs.writeFileSync(datasetPath, createDatasetSource(migratedMemes), "utf8")

  console.log(`\nBacked up original dataset to ${path.relative(process.cwd(), backupPath)}`)
  console.log(`Updated ${path.relative(process.cwd(), datasetPath)} so every meme image points to Cloudinary.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
