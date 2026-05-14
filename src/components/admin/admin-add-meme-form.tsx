"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { RotateCcw, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { CloudinaryImageField } from "@/components/admin/cloudinary-image-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function AdminAddMemeForm() {

  const router = useRouter()

  const fileInputRef = useRef<HTMLInputElement | null>(null)




  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [idTouched, setIdTouched] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [description, setDescription] = useState("")
  const [selectionNotes, setSelectionNotes] = useState("")
  const [tags, setTags] = useState("")
  const [selectionEnabled, setSelectionEnabled] = useState(true)
  const [bulkItems, setBulkItems] = useState<
    Array<{ id: string; name: string; imageUrl: string }>
  >([])
  const [isBulkUploading, setIsBulkUploading] = useState(false)

 

  function handleNameChange(value: string) {
    setName(value)

    if (!idTouched) {
      setId(slugify(value))
    }
  }

  function formatName(value: string) {
    const cleaned = value.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim()
    if (!cleaned) return "Meme"
    return cleaned.replace(/\b\w/g, (char) => char.toUpperCase())
  }

  function getUniqueId(baseId: string, existing: Set<string>) {
    const safeBase = baseId || "meme"
    if (!existing.has(safeBase)) return safeBase

    let counter = 2
    while (existing.has(`${safeBase}-${counter}`)) {
      counter += 1
    }
    return `${safeBase}-${counter}`
  }

  async function uploadFiles(files: File[]) {
    if (!files.length) return

    setIsBulkUploading(true)
    const existingIds = new Set(bulkItems.map((item) => item.id))
    const nextItems: Array<{ id: string; name: string; imageUrl: string }> = []

    for (const file of files) {
      try {
        const baseName = file.name.replace(/\.[^.]+$/, "")
        const formattedName = formatName(baseName)
        const baseId = slugify(baseName || formattedName)
        const uniqueId = getUniqueId(baseId, existingIds)

        const formData = new FormData()
        formData.set("file", file)
        formData.set("name", uniqueId)

        const response = await fetch("/api/admin/upload-meme-image", {
          method: "POST",
          body: formData,
        })

        const data = (await response.json()) as { url?: string; error?: string }

        if (!response.ok || !data.url) {
          throw new Error(data.error || "Upload failed. Try again.")
        }

        nextItems.push({
          id: uniqueId,
          name: formattedName,
          imageUrl: data.url,
        })
        existingIds.add(uniqueId)
      } catch (uploadError) {
        const message =
          uploadError instanceof Error ? uploadError.message : "Upload failed. Try again."
        toast.error(message)
      }
    }

    if (nextItems.length) {
      setBulkItems((prev) => [...prev, ...nextItems])
      toast.success(`Uploaded ${nextItems.length} image${nextItems.length === 1 ? "" : "s"}.`)
    }

    setIsBulkUploading(false)
  }

 const handleSubmit = async (e: React.SubmitEvent)=>{
  e.preventDefault()

  try {
    const payloadTags = tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)

    if (bulkItems.length > 0) {
      const res = await fetch("/api/admin/meme", {
        method: "POST",
        body: JSON.stringify({
          items: bulkItems.map((item) => ({
            id: item.id,
            name: item.name,
            imageUrl: item.imageUrl,
            description,
            selectionNotes,
            tags: payloadTags,
            selectionEnabled,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed")
        return
      }

      toast.success(`Added ${data.count ?? bulkItems.length} meme template${
        data.count === 1 ? "" : "s"
      }`)
      router.refresh()
      return
    }

    const res = await fetch("/api/admin/meme",{
      method: "POST",
      body: JSON.stringify({
         id,
        name,
        imageUrl,
        description,
        selectionNotes,
        tags: payloadTags,
        selectionEnabled,
      })
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || "Failed")
      return
    }

    toast.success("Meme added")
    router.refresh()
  } catch {
      toast.error("Something went wrong")
  }
 }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="id">ID</Label>
          <div className="space-y-2">
            <Input
              id="id"
              name="id"
              value={id}
              onChange={(event) => {
                setIdTouched(true)
                setId(event.target.value)
              }}
              placeholder="drake-hotline-bling"
             
            />
           
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <p>We auto-fill this from the name, but you can override it.</p>
              {idTouched ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setId(slugify(name))
                    setIdTouched(false)
                  }}
                >
                  <RotateCcw />
                  Reset from name
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder="Drake Hotline Bling"
            required={bulkItems.length === 0}
            
          />
          
        </div>
      </div>

      <div className="space-y-3 rounded-3xl border border-dashed border-border/70 bg-muted/20 px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Bulk upload images</p>
            <p className="text-xs text-muted-foreground">
              Drag and drop multiple images to create multiple meme templates at once.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files || [])
                uploadFiles(files)
                event.target.value = ""
              }}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBulkUploading}
            >
              <Upload className="size-4" />
              {isBulkUploading ? "Uploading..." : "Select images"}
            </Button>
          </div>
        </div>
        <div
          className="flex min-h-[120px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/40 px-4 py-6 text-center text-xs text-muted-foreground"
          onDragOver={(event) => {
            event.preventDefault()
          }}
          onDrop={(event) => {
            event.preventDefault()
            const files = Array.from(event.dataTransfer.files || [])
            uploadFiles(files)
          }}
        >
          Drop images here or use the select button.
        </div>

        {bulkItems.length > 0 ? (
          <div className="space-y-3">
            {bulkItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/60 p-3 sm:flex-row sm:items-center"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border/60 bg-muted/40">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="grid flex-1 gap-2 sm:grid-cols-2">
                  <Input
                    value={item.name}
                    onChange={(event) => {
                      const value = event.target.value
                      setBulkItems((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id ? { ...entry, name: value } : entry
                        )
                      )
                    }}
                    placeholder="Name"
                  />
                  <Input
                    value={item.id}
                    onChange={(event) => {
                      const value = slugify(event.target.value)
                      setBulkItems((prev) =>
                        prev.map((entry) =>
                          entry.id === item.id ? { ...entry, id: value } : entry
                        )
                      )
                    }}
                    placeholder="Id"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setBulkItems((prev) => prev.filter((entry) => entry.id !== item.id))
                  }
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <CloudinaryImageField
        id="imageUrl"
        value={imageUrl}
        onChange={setImageUrl}
        fileBaseName={id || name}
        required={bulkItems.length === 0}
      />

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          rows={4}
          placeholder="What this meme visually expresses and when it fits."
         
          className="w-full rounded-3xl border border-input bg-input/30 px-4 py-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20"
        />
      
      </div>

      <div className="space-y-2">
        <Label htmlFor="selectionNotes">Selection notes</Label>
        <textarea
          id="selectionNotes"
          name="selectionNotes"
          value={selectionNotes}
          onChange={(event) => setSelectionNotes(event.target.value)}
          rows={4}
          placeholder="Best-fit situations, edge cases, or matching hints for the AI."
          className="w-full rounded-3xl border border-input bg-input/30 px-4 py-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-ring/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          name="tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="reaction, chaos, office, indian"
        />
      </div>

      <label className="flex items-center gap-3 rounded-3xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
        <input
          type="checkbox"
          name="selectionEnabled"
          checked={selectionEnabled}
          onChange={(event) => setSelectionEnabled(event.target.checked)}
          className="size-4 rounded border-border"
        />
        <span className="text-foreground">Allow AI selection for this meme</span>
      </label>

  

      <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          After saving, the homepage and template API are revalidated automatically.
        </p>
        <Button type="submit" >
          Add template
        </Button>
      </div>
    </form>
  )
}
