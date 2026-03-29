"use client";

import MemePreview from "./MemePreview";
import MemeControls from "./MemeControls";
import { useMemeEditor } from "@/hooks/useMemeEditor";
import { Button } from "../ui/button";

export default function MemeEditor({
  templateImage, hasActiveTemplate, uploadId, handleCustomTemplateChange
}: {
  templateImage: string;
}) {
  const editor = useMemeEditor(templateImage);

  return (
    <section
      key={templateImage}
      className="mb-9 flex w-full max-w-7xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center"
    >
     { !hasActiveTemplate ?

       <div className="flex w-full max-w-md h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-5 text-center">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">Use your own image</h2>
                    <p className="text-sm text-muted-foreground">
                      Upload a local image or template and edit it just like generated
                      memes.
                    </p>
                  </div>
      
                  <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <input
                      id={uploadId}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCustomTemplateChange}
                    />
                    <Button
                      type="button"
                      asChild
                      className="cursor-pointer rounded-xl"
                    >
                      <label htmlFor={uploadId}>Upload Custom Image</label>
                    </Button>
                  </div>
                </div>
     :<MemePreview
        image={editor.image}
        containerRef={editor.containerRef}
        stageRef={editor.stageRef}
        stageWidth={editor.stageWidth}
        stageHeight={editor.stageHeight}
        textLayers={editor.textLayers}
        imageLayers={editor.imageLayers}
        onTextDrag={editor.handleTextDrag}
        onImageDrag={editor.handleImageDrag}
        onImageResize={editor.handleImageResize}
      />

     }

      <MemeControls
        textLayers={editor.textLayers}
        imageLayers={editor.imageLayers}
        updateTextLayer={editor.updateTextLayer}
        updateTextLayerSize={editor.updateTextLayerSize}
        addTextLayer={editor.addTextLayer}
        addImageLayer={editor.addImageLayer}
        removeTextLayer={editor.removeTextLayer}
        removeImageLayer={editor.removeImageLayer}
        downloadMeme={editor.handleDownload}
        resetMeme={editor.handleReset}
      />
    </section>
  );
}
