"use client";

import MemePreview from "./MemePreview";
import MemeControls from "./MemeControls";
import { useMemeEditor } from "@/hooks/useMemeEditor";
import { Button } from "../ui/button";

type MemeEditorProps = {
  templateImage: string | null;
  hasActiveTemplate: boolean;
  uploadId: string;
  handleCustomTemplateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function MemeEditor({
  templateImage,
  hasActiveTemplate,
  uploadId,
  handleCustomTemplateChange,
}: MemeEditorProps) {
  const {
    addImageLayer,
    addTextLayer,
    containerRef,
    handleDownload,
    handleImageDrag,
    handleImageResize,
    handleReset,
    handleTextDrag,
    image,
    imageLayers,
    removeImageLayer,
    removeTextLayer,
    selectedTextLayer,
    selectedTextLayerId,
    setSelectedTextLayerId,
    stageHeight,
    stageRef,
    stageWidth,
    textLayers,
    updateTextLayer,
    updateTextLayerSize,
  } = useMemeEditor(templateImage ?? "");

  return (
    <section
      key={templateImage}
      className="mb-9 flex w-full max-w-7xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center"
    >
     { !hasActiveTemplate ?

       <div className="flex w-full max-w-md h-[400px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-5 text-center">
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
     :<div ref={containerRef} className="w-full max-w-md">
        <MemePreview
          image={image}
          stageRef={stageRef}
          stageWidth={stageWidth}
          stageHeight={stageHeight}
          textLayers={textLayers}
          imageLayers={imageLayers}
          selectedTextLayerId={selectedTextLayerId}
          onTextDrag={handleTextDrag}
          onImageDrag={handleImageDrag}
          onImageResize={handleImageResize}
          onSelectText={setSelectedTextLayerId}
        />
      </div>

     }

      <MemeControls
        textLayers={textLayers}
        imageLayers={imageLayers}
        selectedTextLayer={selectedTextLayer}
        selectTextLayer={setSelectedTextLayerId}
        updateTextLayer={updateTextLayer}
        updateTextLayerSize={updateTextLayerSize}
        addTextLayer={addTextLayer}
        addImageLayer={addImageLayer}
        removeTextLayer={removeTextLayer}
        removeImageLayer={removeImageLayer}
        downloadMeme={handleDownload}
        resetMeme={handleReset}
      />
    </section>
  );
}
