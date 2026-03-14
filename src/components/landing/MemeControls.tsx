"use client"

import { MemeTextLayer } from "@/types/meme"
import { Download, Plus, RotateCcw, X } from "lucide-react"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

type Props = {
  textLayers: MemeTextLayer[]
  updateTextLayer: (id: string, value: string) => void
  updateTextLayerSize: (id: string, value: number) => void
  addTextLayer: () => void
  removeTextLayer: (id: string) => void
  downloadMeme: () => void
  resetMeme: () => void
}

export default function MemeControls({
  textLayers,
  updateTextLayer,
  updateTextLayerSize,
  addTextLayer,
  removeTextLayer,
  downloadMeme,
  resetMeme,
}: Props) {
  return (
    <div className="flex w-full max-w-md flex-col gap-6 rounded-[2rem] border border-border/60 bg-card/80 p-6 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur lg:w-[320px] lg:flex-none">
      <div className="text-center">
       
        <h3 className="text-2xl font-semibold tracking-tight">Editor</h3>
       
      </div>

      <div className="flex flex-col gap-3">
        <div className="space-y-4">
          {textLayers.map((layer, index) => (
            <div key={layer.id} className="space-y-3 rounded-[1.5rem] border border-border/60 bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder={`Text ${index + 1}`}
                  value={layer.text}
                  onChange={(e) => updateTextLayer(layer.id, e.target.value)}
                  className="h-12 rounded-2xl"
                />
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

        <Button type="button" onClick={addTextLayer} className="h-11 rounded-2xl cursor-pointer">
          <Plus className="size-4" />
          Add Text
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" className="h-12 flex-1 rounded-2xl" onClick={downloadMeme}>
          <Download className="size-4" />
          Download Meme
        </Button>
        <Button type="button" variant="outline" className="h-12 rounded-2xl" onClick={resetMeme}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
      </div>
    </div>
  )
}
