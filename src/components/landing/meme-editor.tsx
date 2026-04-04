"use client";

import MemePreview from "./MemePreview";
import MemeControls from "./MemeControls";
import { useMemeEditor } from "@/hooks/useMemeEditor";
import { FileUpload } from "../ui/file-upload";

type MemeEditorProps = {
  templateImage: string | null;
  hasActiveTemplate: boolean;
  handleCustomTemplateSelect: (file: File) => void;
  clearActiveTemplate: () => void;
};

export default function MemeEditor({
  templateImage,
  hasActiveTemplate,
  handleCustomTemplateSelect,
  clearActiveTemplate,
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
      <div className="w-full max-w-md h-[400px]  border-dashed border-2 rounded-xl ">
        <FileUpload
          onChange={(files) => {
            const file = files[0]
            if (!file) return
            handleCustomTemplateSelect(file)
          }}
          
        />
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
        hasActiveTemplate={hasActiveTemplate}
        clearActiveTemplate={clearActiveTemplate}
      />
    </section>
  );
}
