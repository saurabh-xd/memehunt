"use client"

import { ChangeEvent, useId } from "react"
import { MemeImageLayer, MemeTextLayer } from "@/types/meme"
import { Download, ImagePlus, Plus, RotateCcw, X } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

type Props = {
  textLayers: MemeTextLayer[]
  imageLayers: MemeImageLayer[]
  selectedTextLayer: MemeTextLayer | null
  selectTextLayer: (id: string | null) => void
  updateTextLayer: (id: string, value: string) => void
  updateTextLayerSize: (id: string, value: number) => void
  addTextLayer: () => void
  addImageLayer: (file: File) => Promise<void>
  removeTextLayer: (id: string) => void
  removeImageLayer: (id: string) => void
  downloadMeme: () => void
  resetMeme: () => void
}

export default function MemeControls({
  textLayers,
  imageLayers,
  selectedTextLayer,
  selectTextLayer,
  updateTextLayer,
  updateTextLayerSize,
  addTextLayer,
  addImageLayer,
  removeTextLayer,
  removeImageLayer,
  downloadMeme,
  resetMeme,
}: Props) {
  const imageUploadId = useId()

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    await addImageLayer(file)
    event.target.value = ""
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-6 rounded-[2rem] border border-border/60 bg-card/80 p-5 py-7 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur lg:flex-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        
          <h3 className="text-lg font-semibold">Editor Controls</h3>
         
    
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="h-9 rounded-xl bg-emerald-600 px-3 text-white hover:bg-emerald-700"
            onClick={downloadMeme}
          >
            <Download className="size-4" />
            Download
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 rounded-xl border-border/70 px-3 text-muted-foreground hover:text-foreground"
            onClick={resetMeme}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          {textLayers.map((layer, index) => (
            // <div
              
            //   className={`space-y-3 rounded-[1.5rem] border p-4 transition-colors ${
            //     selectedTextLayerId === layer.id
            //       ? "border-foreground/30 bg-muted/40"
            //       : "border-border/60 bg-background/70"
            //   }`}
            // >
              <div key={layer.id} className="flex items-center gap-2">
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
                  onFocus={() => selectTextLayer(layer.id)}
                  onClick={() => selectTextLayer(layer.id)}
                  className="h-12 rounded-2xl"
                />
              </div>
           
          ))}
        </div>


{/* text size control  */}
        <div className="space-y-3 rounded-[1.5rem] border border-border/60 bg-background/70 p-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {selectedTextLayer ? "Selected text size" : "Text size"}
            </label>
            <span className="text-sm text-muted-foreground">
              {selectedTextLayer ? `${selectedTextLayer.fontSize}px` : "Select text"}
            </span>
          </div>
          <input
            type="range"
            min="24"
            max="84"
            value={selectedTextLayer?.fontSize ?? 44}
            onChange={(e) => {
              if (!selectedTextLayer) return
              updateTextLayerSize(selectedTextLayer.id, Number(e.target.value))
            }}
            disabled={!selectedTextLayer}
            className="w-full accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

       {/* add text and image control */}

        <div className="grid grid-cols-2 gap-2">
        <Button type="button" onClick={addTextLayer} className="h-11 rounded-2xl cursor-pointer">
          <Plus className="size-4" />
          Add Text
        </Button>
        <div>
          <input
          id={imageUploadId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

          <Button type="button" asChild variant="outline" className="h-11 w-full rounded-2xl cursor-pointer">
            <label htmlFor={imageUploadId}>
              <ImagePlus className="size-4" />
              Add Image
            </label>
          </Button>
        </div>

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
  )
}
