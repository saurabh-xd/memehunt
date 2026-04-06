"use client";

import MemePreview from "./MemePreview";
import MemeControls from "./MemeControls";
import { useMemeEditor } from "@/hooks/useMemeEditor";
import { FileUpload } from "../ui/file-upload";

type MemeEditorProps = {
  templateImage: string | null;
  hasActiveTemplate: boolean;
  isSignedIn: boolean;
  handleCustomTemplateSelect: (file: File) => void;
  clearActiveTemplate: () => void;
  openWatermarkSignInDialog: () => void;
};

export default function MemeEditor({
  templateImage,
  hasActiveTemplate,
  isSignedIn,
  handleCustomTemplateSelect,
  clearActiveTemplate,
  openWatermarkSignInDialog,
}: MemeEditorProps) {
  const {
    addImageLayer,
    addTextLayer,
    containerRef,
    customWatermark,
    defaultWatermarkText,
    handleDownload,
    handleImageDrag,
    handleImageResize,
    handleReset,
    handleTextDrag,
    image,
    imageLayers,
    removeImageLayer,
    removeTextLayer,
    selectedImageLayerId,
    selectedTextLayer,
    selectedTextLayerId,
    setCustomWatermark,
    setSelectedImageLayerId,
    setSelectedTextLayerId,
    setShowDefaultWatermark,
    showDefaultWatermark,
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
      className="mb-7 flex w-full max-w-7xl flex-col items-stretch gap-5 sm:mb-9 sm:gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-8"
    >
     { !hasActiveTemplate ?
      <div className="h-[300px] w-full max-w-md self-center rounded-2xl border-2 border-dashed sm:h-[360px] lg:h-[400px] lg:self-auto">
        <FileUpload
          onChange={(files) => {
            const file = files[0]
            if (!file) return
            handleCustomTemplateSelect(file)
          }}
          className="h-full"
          contentClassName="h-full rounded-xl bg-card/60"
          title="Upload Custom Image"
          description="Drop your image here or click to start editing it"
        />
      </div>
     :<div ref={containerRef} className="w-full max-w-md self-center lg:max-w-xl lg:self-auto">
        <MemePreview
          image={image}
          stageRef={stageRef}
          stageWidth={stageWidth}
          stageHeight={stageHeight}
          textLayers={textLayers}
          imageLayers={imageLayers}
          selectedImageLayerId={selectedImageLayerId}
          selectedTextLayerId={selectedTextLayerId}
          defaultWatermarkText={defaultWatermarkText}
          customWatermark={customWatermark}
          showDefaultWatermark={showDefaultWatermark}
          onTextDrag={handleTextDrag}
          onImageDrag={handleImageDrag}
          onImageResize={handleImageResize}
          onSelectImage={setSelectedImageLayerId}
          onSelectText={setSelectedTextLayerId}
        />
      </div>

     }

      <MemeControls
        textLayers={textLayers}
        imageLayers={imageLayers}
        selectedImageLayerId={selectedImageLayerId}
        selectImageLayer={setSelectedImageLayerId}
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
        isSignedIn={isSignedIn}
        defaultWatermarkText={defaultWatermarkText}
        customWatermark={customWatermark}
        showDefaultWatermark={showDefaultWatermark}
        setCustomWatermark={setCustomWatermark}
        setShowDefaultWatermark={setShowDefaultWatermark}
        openWatermarkSignInDialog={openWatermarkSignInDialog}
      />
    </section>
  );
}
