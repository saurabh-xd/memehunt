"use client";

import MemePreview from "./MemePreview";
import MemeControls from "./MemeControls";
import { useMemeEditor } from "@/hooks/useMemeEditor";

export default function MemeEditor({
  templateImage,
}: {
  templateImage: string;
}) {
  const editor = useMemeEditor(templateImage);

  return (
    <section
      key={templateImage}
      className="mb-9 flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center"
    >
      <MemePreview
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
