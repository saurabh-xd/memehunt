"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type CloudinaryImageFieldProps = {
  id: string
  name?: string
  label?: string
  initialValue?: string
  value?: string
  onChange?: (value: string) => void
  fileBaseName?: string
  required?: boolean
  error?: string
}

type UploadState = {
  status: "idle" | "uploading" | "success" | "error"
  message: string
}

export function CloudinaryImageField({
  id,
  name = "imageUrl",
  label = "Cloudinary image URL",
  initialValue = "",
  value,
  onChange,
  fileBaseName = "",
  required = false,
  error,
}: CloudinaryImageFieldProps) {
  const [internalImageUrl, setInternalImageUrl] = useState(initialValue)
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    message: "",
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const imageUrl = value ?? internalImageUrl

  function updateImageUrl(nextValue: string) {
    if (onChange) {
      onChange(nextValue)
      return
    }

    setInternalImageUrl(nextValue)
  }

  useEffect(() => {
    if (value === undefined) {
      setInternalImageUrl(initialValue)
    }
  }, [initialValue, value])

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      setUploadState({
        status: "uploading",
        message: "Uploading image to Cloudinary...",
      })

      const formData = new FormData()
      formData.set("file", file)

      if (fileBaseName.trim()) {
        formData.set("name", fileBaseName.trim())
      }

      const response = await fetch("/api/admin/upload-meme-image", {
        method: "POST",
        body: formData,
      })

      const data = (await response.json()) as { url?: string; error?: string }

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Upload failed. Try again.")
      }

      updateImageUrl(data.url)
      setUploadState({
        status: "success",
        message: "Image uploaded. URL filled in automatically.",
      })
      toast.success("Image uploaded to Cloudinary.")
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "Upload failed. Try again."

      setUploadState({
        status: "error",
        message,
      })
      toast.error(message)
    } finally {
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          name={name}
          value={imageUrl}
          onChange={(event) => updateImageUrl(event.target.value)}
          placeholder="https://res.cloudinary.com/..."
          required={required}
          aria-invalid={error ? "true" : "false"}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-dashed border-border/70 bg-muted/20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Upload a file instead</p>
            <p className="text-xs text-muted-foreground">
              Choose an image and we will upload it to Cloudinary for you.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadState.status === "uploading"}
            >
              <Upload />
              {uploadState.status === "uploading" ? "Uploading..." : "Upload image"}
            </Button>
            {imageUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateImageUrl("")}
              >
                <X />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        {uploadState.status !== "idle" ? (
          <p
            className={`text-sm ${
              uploadState.status === "error"
                ? "text-destructive"
                : uploadState.status === "success"
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-muted-foreground"
            }`}
          >
            {uploadState.message}
          </p>
        ) : null}

        {imageUrl ? (
          <div className="flex items-start gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-border/70 bg-muted/40">
              <Image
                src={imageUrl}
                alt="Uploaded meme preview"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <p className="min-w-0 text-xs leading-5 break-all text-muted-foreground">
              {imageUrl}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
