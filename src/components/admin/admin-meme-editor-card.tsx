"use client"

import Image from "next/image"
import {  useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { CloudinaryImageField } from "@/components/admin/cloudinary-image-field"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "../ui/button"

type AdminMemeEditorCardProps = {
  meme: {
    id: string
    name: string
    imageUrl: string
    description: string
    selectionNotes: string | null
    selectionEnabled: boolean
    tags: string[]
  }
}



export function AdminMemeEditorCard({ meme }: AdminMemeEditorCardProps) {
  const router = useRouter()


const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
  if (!confirm(`Delete "${meme.name}"?`)) return

  try {
    setLoading(true)

    await fetch("/api/admin/meme", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: meme.id }),
    })

    toast.success("Deleted")
    router.refresh()
  } catch {
    toast.error("Delete failed")
  }

  setLoading(false)
}

const handleToggle = async () => {
  try {
    await fetch("/api/admin/meme/toggle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: meme.id,
        enabled: !meme.selectionEnabled,
      }),
    })

    router.refresh()
  } catch {
    toast.error("Toggle failed")
  }
}

const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  const formData = new FormData(e.currentTarget)

  const data = {
    id: meme.id,
    name: formData.get("name"),
    description: formData.get("description"),
    selectionNotes: formData.get("selectionNotes"),
    tags: String(formData.get("tags") || "")
      .split(",")
      .map(t => t.trim()),
    selectionEnabled: formData.get("selectionEnabled") === "on",
  }

  try {
    await fetch("/api/admin/meme", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    toast.success("Updated")
    router.refresh()
  } catch {
    toast.error("Update failed")
  }
}


  return (
    <Card className="gap-0 border border-border/70 bg-card/80">
      <div className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative aspect-square overflow-hidden bg-muted/40">
          <Image
            src={meme.imageUrl}
            alt={meme.name}
            fill
            sizes="(max-width: 1024px) 100vw, 220px"
            className="object-cover"
          />
        </div>

        <CardContent className="pt-5">
          <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-foreground">{meme.name}</h2>
              <p className="text-xs text-muted-foreground">{meme.id}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  meme.selectionEnabled
                    ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {meme.selectionEnabled ? "Enabled" : "Disabled"}
              </span>

              <form onSubmit={handleToggle}>
                <input type="hidden" name="id" value={meme.id} />
                <input
                  type="hidden"
                  name="nextSelectionEnabled"
                  value={String(!meme.selectionEnabled)}
                />
                <Button onClick={handleToggle}>
                  {meme.selectionEnabled ? "Disable quickly" : "Enable quickly"}
                </Button>
              </form>

              <form
                
                onSubmit={handleDelete}
              >
                <input type="hidden" name="id" value={meme.id} />
                <Button onClick={handleDelete} disabled={loading} variant="outline"> 
  <Trash2 />
  Delete
</Button>
              </form>
            </div>
          </div>

          <form onSubmit={handleUpdate}className="space-y-5 pt-5">
            <input type="hidden" name="id" value={meme.id} />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`name-${meme.id}`}>Name</Label>
                <Input
                  id={`name-${meme.id}`}
                  name="name"
                  defaultValue={meme.name}
                  required
                
                />
               
              </div>

              <div className="space-y-2">
                <Label htmlFor={`tags-${meme.id}`}>Tags</Label>
                <Input
                  id={`tags-${meme.id}`}
                  name="tags"
                  defaultValue={meme.tags.join(", ")}
                  placeholder="reaction, chaos, office"
                />
              </div>
            </div>

            <CloudinaryImageField
              id={`imageUrl-${meme.id}`}
              initialValue={meme.imageUrl}
              fileBaseName={meme.id}
              required
              
            />

            <div className="space-y-2">
              <Label htmlFor={`description-${meme.id}`}>Description</Label>
              <textarea
                id={`description-${meme.id}`}
                name="description"
                defaultValue={meme.description}
                required
                rows={3}
                
                className="w-full rounded-3xl border border-input bg-input/30 px-4 py-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20"
              />
            
            </div>

            <div className="space-y-2">
              <Label htmlFor={`selectionNotes-${meme.id}`}>Selection notes</Label>
              <textarea
                id={`selectionNotes-${meme.id}`}
                name="selectionNotes"
                defaultValue={meme.selectionNotes ?? ""}
                rows={3}
                className="w-full rounded-3xl border border-input bg-input/30 px-4 py-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-[1px] focus-visible:ring-ring/50"
              />
            </div>

            <label className="flex items-center gap-3 rounded-3xl border border-border/70 bg-muted/30 px-4 py-3 text-sm">
              <input
                type="checkbox"
                name="selectionEnabled"
                defaultChecked={meme.selectionEnabled}
                className="size-4 rounded border-border"
              />
              <span className="text-foreground">Allow AI selection for this meme</span>
            </label>

           

            <div className="flex justify-end border-t border-border/60 pt-4">
              <Button type="submit" >
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </div>
    </Card>
  )
}
