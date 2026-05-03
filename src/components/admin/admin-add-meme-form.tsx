"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { RotateCcw } from "lucide-react"
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

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const previousToastKeyRef = useRef("")




  const [name, setName] = useState("")
  const [id, setId] = useState("")
  const [idTouched, setIdTouched] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [description, setDescription] = useState("")
  const [selectionNotes, setSelectionNotes] = useState("")
  const [tags, setTags] = useState("")
  const [selectionEnabled, setSelectionEnabled] = useState(true)

 

  function handleNameChange(value: string) {
    setName(value)

    if (!idTouched) {
      setId(slugify(value))
    }
  }

 const handleSubmit = async (e: React.SubmitEvent)=>{
  e.preventDefault()
  setLoading(true)
  setErrors({})

  try {
    const res = await fetch("/api/admin/meme",{
      method: "POST",
      body: JSON.stringify({
         id,
        name,
        imageUrl,
        description,
        selectionNotes,
        tags: tags.split(",").map(t => t.trim().toLowerCase()),
        selectionEnabled,
      })
    })

    const data = await res.json()

    if (!res.ok) {
      setErrors(data.fieldErrors || {})
      toast.error(data.error || "Failed")
      return
    }

    toast.success("Meme added")
    router.refresh()
  } catch (error) {
      toast.error("Something went wrong")
  }
    setLoading(false)
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
            required
            
          />
          
        </div>
      </div>

      <CloudinaryImageField
        id="imageUrl"
        value={imageUrl}
        onChange={setImageUrl}
        fileBaseName={id || name}
        required
      
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
