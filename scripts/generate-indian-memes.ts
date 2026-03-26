import fs from "node:fs"
import path from "node:path"

const memesDir = path.join(process.cwd(), "public", "memes", "indian")

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

if (!fs.existsSync(memesDir)) {
  console.error(`Folder not found: ${memesDir}`)
  process.exit(1)
}

const files = fs
  .readdirSync(memesDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right))

const starters = files.map((fileName) => {
  const slug = toSlug(fileName)
  const title = toTitle(slug)
  const image = `/memes/indian/${fileName}`

  return `{
  id: "${slug}",
  name: "${title}",
  image: "${image}",
  description: "",
  aliases: ["${title.toLowerCase()}"],
  keywords: [],
  emotions: [],
  scenarios: [],
}`
})

console.log(starters.join(",\n\n"))
