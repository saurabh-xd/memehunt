"use client"

import { ChangeEvent, useId } from "react"
import { MemeImageLayer, MemeTextLayer } from "@/types/meme"
import { ImagePlus, Plus, X } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

type Props = {
  textLayers: MemeTextLayer[]
  imageLayers: MemeImageLayer[]
  updateTextLayer: (id: string, value: string) => void
  updateTextLayerSize: (id: string, value: number) => void
  addTextLayer: () => void
  addImageLayer: (file: File) => Promise<void>
  removeTextLayer: (id: string) => void
  removeImageLayer: (id: string) => void
  
}

export default function MemeControls({
  textLayers,
  imageLayers,
  updateTextLayer,
  updateTextLayerSize,
  addTextLayer,
  addImageLayer,
  removeTextLayer,
  removeImageLayer,
}: Props) {
  const imageUploadId = useId()

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    await addImageLayer(file)
    event.target.value = ""
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-6 rounded-[2rem]   shadow-[0_18px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur  lg:flex-none">

      <div className="flex flex-col gap-3">



       

        <div className="space-y-4">
          {textLayers.map((layer, index) => (
            <div
              key={layer.id}
              className="space-y-3 rounded-[1.5rem] "
            >
              <div className="flex items-center gap-1">

                {index >= 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeTextLayer(layer.id)}
                    className="size-12 rounded-2xl px-0"
                    aria-label={`Remove text ${index + 1}`}
                  >
                    <X className="size-4" />
                  </Button>
                )}

                                <Input
                  placeholder={`Text ${index + 1}`}
                  value={layer.text}
                  onChange={(e) => updateTextLayer(layer.id, e.target.value)}
                  className="h-12 rounded-2xl"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Text {index + 1} size</label>
                  <span className="text-sm text-muted-foreground">{layer.fontSize}px</span>
                </div>

                <input
                  type="range"
                  min="24"
                  max="84"
                  value={layer.fontSize}
                  onChange={(e) => updateTextLayerSize(layer.id, Number(e.target.value))}
                  className="w-full accent-foreground"
                />
              </div>
            </div>
          ))}
        </div>

<div className="flex gap-2">



        <Button type="button" onClick={addTextLayer} className="h-11 flex-1  rounded-2xl cursor-pointer">
          <Plus className="size-4" />
          Add Text
        </Button>
        <div className="flex flex-col gap-2 flex-1">
   <input
          id={imageUploadId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <Button type="button" asChild variant="outline" className="h-11  rounded-2xl cursor-pointer">
          <label htmlFor={imageUploadId}>
            <ImagePlus className="size-4" />
            Add Image
          </label>
        </Button>

        {imageLayers.length > 0 && (
          <div className="space-y-3 rounded-[1.5rem] border border-border/60 bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Images</p>
              <p className="text-xs text-muted-foreground">Drag and resize on canvas</p>
            </div>

            {imageLayers.map((layer, index) => (
              <div
                key={layer.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/70 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">Image {index + 1}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(layer.width)} x {Math.round(layer.height)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removeImageLayer(layer.id)}
                  className="size-10 rounded-2xl px-0"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

</div>

        </div>

      </div>

     
    </div>
  )
}
