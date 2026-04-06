"use client"

import { ChangeEvent, useId } from "react"
import { MemeImageLayer, MemeTextLayer } from "@/types/meme"
import { Download, ImagePlus, Plus, RotateCcw, X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

type Props = {
  textLayers: MemeTextLayer[]
  imageLayers: MemeImageLayer[]
  selectedImageLayerId: string | null
  selectedTextLayer: MemeTextLayer | null
  selectImageLayer: (id: string | null) => void
  selectTextLayer: (id: string | null) => void
  updateTextLayer: (id: string, value: string) => void
  updateTextLayerSize: (id: string, value: number) => void
  addTextLayer: () => void
  addImageLayer: (file: File) => Promise<void>
  removeTextLayer: (id: string) => void
  removeImageLayer: (id: string) => void
  downloadMeme: () => void
  resetMeme: () => void
  hasActiveTemplate: boolean
  clearActiveTemplate: () => void
  isSignedIn: boolean
  defaultWatermarkText: string
  customWatermark: string
  showDefaultWatermark: boolean
  setCustomWatermark: (value: string) => void
  setShowDefaultWatermark: (value: boolean) => void
  openWatermarkSignInDialog: () => void
}

export default function MemeControls({
  textLayers,
  imageLayers,
  selectedImageLayerId,
  selectedTextLayer,
  selectImageLayer,
  selectTextLayer,
  updateTextLayer,
  updateTextLayerSize,
  addTextLayer,
  addImageLayer,
  removeTextLayer,
  removeImageLayer,
  downloadMeme,
  resetMeme,
  hasActiveTemplate,
  clearActiveTemplate,
  isSignedIn,
  defaultWatermarkText,
  customWatermark,
  showDefaultWatermark,
  setCustomWatermark,
  setShowDefaultWatermark,
  openWatermarkSignInDialog,
}: Props) {
  const imageUploadId = useId()

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    await addImageLayer(file)
    event.target.value = ""
  }

  function handleDefaultWatermarkToggle() {
    if (!isSignedIn) {
      openWatermarkSignInDialog()
      return
    }

    setShowDefaultWatermark(!showDefaultWatermark)
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-xl border border-border/60 bg-card/80 px-4 py-5 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur lg:flex-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      
          
          <div className="flex flex-wrap items-center gap-2">
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
      

        {hasActiveTemplate && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 rounded-xl cursor-pointer border-border/70 px-3 text-muted-foreground hover:border-destructive/40 hover:text-destructive sm:self-start"
            onClick={clearActiveTemplate}
          >
            <X className="size-4" />
            Clear Template
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          {textLayers.map((layer, index) => (
              <div key={layer.id} className="relative">
                <textarea
                  placeholder={`Text ${index + 1}`}
                  value={layer.text}
                  onChange={(e) => updateTextLayer(layer.id, e.target.value)}
                  onFocus={() => selectTextLayer(layer.id)}
                  onClick={() => selectTextLayer(layer.id)}
                  rows={Math.max(1, layer.text.split("\n").length)}
                  className={
                    index >= 2
                      ? "min-h-12 w-full resize-none rounded-2xl border border-input bg-transparent px-3 py-3 pr-12 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      : "min-h-12 w-full resize-none rounded-2xl border border-input bg-transparent px-3 py-3 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  }
                />
                {index >= 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTextLayer(layer.id)}
                    className="absolute right-1 top-1 size-10 rounded-xl cursor-pointer text-muted-foreground hover:text-destructive"
                    aria-label={`Remove text ${index + 1}`}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
           
          ))}

           <div className="relative">
            <Input
              id="custom-watermark"
              value={customWatermark}
              placeholder={
                isSignedIn
                  ? showDefaultWatermark
                    ? defaultWatermarkText
                    : "Add custom watermark"
                  : "Sign in to add custom watermark"
              }
              readOnly={!isSignedIn}
              onPointerDown={!isSignedIn ? (event) => {
                event.preventDefault()
                openWatermarkSignInDialog()
              } : undefined}
              onFocus={!isSignedIn ? (event) => {
                event.target.blur()
                openWatermarkSignInDialog()
              } : undefined}
              onChange={(event) => {
                if (!isSignedIn) {
                  openWatermarkSignInDialog()
                  return
                }
                setCustomWatermark(event.target.value)
              }}
              className="h-10 rounded-2xl pr-18"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 rounded-md px-3 text-xs cursor-pointer"
              onClick={handleDefaultWatermarkToggle}
            >
              {showDefaultWatermark ? "Hide" : "Show"}
            </Button>
          </div>
        </div>

       

       
         
      


{/* text size control  */}
        <div className="space-y- rounded-xl border border-border/60 bg-background/70 p-2 px-3">
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
            className="h-1.5 w-full cursor-pointer accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

       

       {/* add text and image control */}

        <div className="grid grid-cols-2 gap-2">
        <Button type="button" onClick={addTextLayer} className="h-11 rounded-2xl cursor-pointer bg-gradient-to-b from-blue-300 to-blue-500 text-white font-medium hover:opacity-80 transition-all duration-300">
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
          <div className="col-span-2 space-y-3 rounded-[1.5rem]  mt-1">
           

            {imageLayers.map((layer, index) => (
              <div
                key={layer.id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2 transition-colors ${
                  selectedImageLayerId === layer.id
                    ? "border-foreground/25 bg-background"
                    : "border-border/60 bg-background/70 hover:border-foreground/15"
                }`}
                onClick={() => {
                  selectTextLayer(null)
                  selectImageLayer(layer.id)
                }}
              >
               
                  <p className="text-sm font-medium">Image {index + 1}</p>
                 
               
                <div className="flex items-center gap-2">
                  {selectedImageLayerId === layer.id && (
                    <span className="text-xs font-medium text-muted-foreground">Selected</span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation()
                      removeImageLayer(layer.id)
                    }}
                    className="size-10 rounded-2xl px-0"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        </div>

      </div>

    </div>
  )
}
