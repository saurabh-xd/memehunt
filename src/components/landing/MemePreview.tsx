"use client"

import Konva from "konva"
import { useEffect, useRef } from "react"
import type { RefObject } from "react"
import { motion } from "motion/react"
import { Image as KonvaImage, Layer, Stage, Text, Transformer } from "react-konva"
import useImage from "use-image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MemeImageLayer, MemeTextLayer } from "@/types/meme"

type Props = {
  image: HTMLImageElement | undefined
  stageRef: RefObject<import("konva/lib/Stage").Stage | null>
  stageWidth: number
  stageHeight: number
  textLayers: MemeTextLayer[]
  imageLayers: MemeImageLayer[]
  selectedImageLayerId: string | null
  selectedTextLayerId: string | null
  defaultWatermarkText: string
  customWatermark: string
  showDefaultWatermark: boolean
  onTextDrag: (id: string, position: { x: number; y: number }) => void
  onImageDrag: (id: string, position: { x: number; y: number }) => void
  onImageResize: (id: string, size: { width: number; height: number; x: number; y: number }) => void
  onSelectImage: (id: string | null) => void
  onSelectText: (id: string | null) => void
  hasMultipleTemplates?: boolean
  currentIndex?: number
  totalTemplates?: number
  onPrevTemplate?: () => void
  onNextTemplate?: () => void
}

function EditableImageLayer({
  layer,
  isSelected,
  onSelect,
  onImageDrag,
  onImageResize,
}: {
  layer: MemeImageLayer
  isSelected: boolean
  onSelect: () => void
  onImageDrag: (id: string, position: { x: number; y: number }) => void
  onImageResize: (id: string, size: { width: number; height: number; x: number; y: number }) => void
}) {
  const [image] = useImage(layer.src)
  const imageRef = useRef<Konva.Image | null>(null)
  const transformerRef = useRef<Konva.Transformer | null>(null)

  useEffect(() => {
    if (!isSelected || !imageRef.current || !transformerRef.current) return
    transformerRef.current.nodes([imageRef.current])
    transformerRef.current.getLayer()?.batchDraw()
  }, [isSelected])

  return (
    <>
      {image && (
        <KonvaImage
          ref={imageRef}
          image={image}
          x={layer.position.x}
          y={layer.position.y}
          width={layer.width}
          height={layer.height}
          draggable
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={onSelect}
          onDragMove={(event) =>
            onImageDrag(layer.id, { x: event.target.x(), y: event.target.y() })
          }
          onTransformEnd={() => {
            const node = imageRef.current
            if (!node) return

            const width = Math.max(48, node.width() * node.scaleX())
            const height = Math.max(48, node.height() * node.scaleY())

            node.scaleX(1)
            node.scaleY(1)

            onImageResize(layer.id, {
              width,
              height,
              x: node.x(),
              y: node.y(),
            })
          }}
        />
      )}

      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          keepRatio
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 48 || newBox.height < 48) {
              return oldBox
            }

            return newBox
          }}
        />
      )}
    </>
  )
}

export default function MemePreview({
  image,
  stageRef,
  stageWidth,
  stageHeight,
  textLayers,
  imageLayers,
  selectedImageLayerId,
  selectedTextLayerId,
  defaultWatermarkText,
  customWatermark,
  showDefaultWatermark,
  onTextDrag,
  onImageDrag,
  onImageResize,
  onSelectImage,
  onSelectText,
  hasMultipleTemplates = false,
  currentIndex = 0,
  totalTemplates = 1,
  onPrevTemplate,
  onNextTemplate,
}: Props) {
  function setStageCursor(cursor: string) {
    const stage = stageRef.current
    if (!stage) return
    stage.container().style.cursor = cursor
  }

  const isMobileViewport =
    typeof window !== "undefined" && window.innerWidth < 640

  const memeFontFamily = isMobileViewport
    ? "Anton, Impact, Arial Black, sans-serif"
    : "Impact, Arial Black, sans-serif"

  const sharedTextProps = {
    fontFamily: memeFontFamily,
    fontStyle: "bold" as const,
    fill: "#f8fafc",
    stroke: "#000000",
    lineJoin: "round" as const,
    shadowColor: "rgba(0, 0, 0, 0.16)",
    shadowBlur: 1,
    shadowOffset: { x: 0, y: 1 },
    shadowOpacity: 0.35,
    width: stageWidth - 24,
    align: "center" as const,
  }

  const watermarkText = customWatermark.trim() || (showDefaultWatermark ? defaultWatermarkText : "")
  const watermarkPadding = Math.max(10, Math.round(Math.min(stageWidth, stageHeight) * 0.03))
  const watermarkFontSize = Math.max(
    8,
    Math.min(12, Math.round(Math.min(stageWidth, stageHeight) * 0.032))
  )
  const watermarkWidth = Math.min(
    stageWidth - watermarkPadding * 2,
    Math.round(watermarkText.length * watermarkFontSize * 0.72)
  )
  const watermarkX = watermarkPadding
  const watermarkY = Math.max(
    watermarkPadding,
    stageHeight - watermarkPadding - Math.round(watermarkFontSize * 1.15)
  )

  const touchStartXRef = useRef<number | null>(null)
  const touchStartYRef = useRef<number | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX
      touchStartYRef.current = e.touches[0].clientY
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const deltaX = touchEndX - touchStartXRef.current
    const deltaY = touchEndY - touchStartYRef.current

    // Horizontal swipe threshold: at least 40px and predominantly horizontal
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX > 0) {
        onPrevTemplate?.()
      } else {
        onNextTemplate?.()
      }
    }

    touchStartXRef.current = null
    touchStartYRef.current = null
  }

  useEffect(() => {
    if (!hasMultipleTemplates) return

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        onPrevTemplate?.()
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        onNextTemplate?.()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [hasMultipleTemplates, onPrevTemplate, onNextTemplate])

  return (
    <div
      className="relative mx-auto flex flex-col items-center gap-3 select-none w-full max-w-full"
      style={{ width: stageWidth }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        className="overflow-hidden rounded-[1.25rem] border border-black/10 bg-black/5 bg-card sm:rounded-[1.5rem]"
        style={{ width: stageWidth, height: stageHeight, lineHeight: 0 }}
        initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
        whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{
          duration: 0.3,
          delay: 0.1,
          ease: "easeInOut",
        }}
        viewport={{ once: true }}
      >
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          style={{ display: "block" }}
          onMouseDown={(event) => {
            if (event.target === event.target.getStage()) {
              onSelectImage(null)
              onSelectText(null)
            }
          }}
        >
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                width={stageWidth}
                height={stageHeight}
              />
            )}

            {imageLayers.map((layer) => (
              <EditableImageLayer
                key={layer.id}
                layer={layer}
                isSelected={selectedImageLayerId === layer.id}
                onSelect={() => {
                  onSelectText(null)
                  onSelectImage(layer.id)
                }}
                onImageDrag={onImageDrag}
                onImageResize={onImageResize}
              />
            ))}

            {textLayers.map((layer) => (
              <Text
                key={layer.id}
                text={layer.text}
                x={layer.position.x}
                y={layer.position.y}
                fontSize={layer.fontSize}
                {...sharedTextProps}
                strokeWidth={Math.max(0.35, layer.fontSize * 0.013)}
                opacity={selectedTextLayerId === layer.id ? 0.88 : 1}
                scaleX={selectedTextLayerId === layer.id ? 1.02 : 1}
                scaleY={selectedTextLayerId === layer.id ? 1.02 : 1}
                draggable
                onDragStart={() => {
                  onSelectImage(null)
                  onSelectText(layer.id)
                }}
                onDragMove={(event) =>
                  onTextDrag(layer.id, { x: event.target.x(), y: event.target.y() })
                }
                onDragEnd={() => onSelectText(layer.id)}
                onMouseEnter={() => setStageCursor("pointer")}
                onMouseLeave={() => setStageCursor("default")}
                onClick={() => {
                  onSelectImage(null)
                  onSelectText(layer.id)
                }}
                onTap={() => {
                  onSelectImage(null)
                  onSelectText(layer.id)
                }}
              />
            ))}

            {image && watermarkText && (
              <Text
                text={watermarkText}
                x={watermarkX}
                y={watermarkY}
                width={watermarkWidth}
                align="left"
                fontSize={watermarkFontSize}
                fontFamily="Inter, Arial, sans-serif"
                fontStyle="bold"
                fill="rgba(255, 255, 255, 0.55)"
                shadowColor="rgba(0, 0, 0, 0.35)"
                shadowBlur={2}
                shadowOffset={{ x: 0, y: 1 }}
                shadowOpacity={0.4}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      </motion.div>

      {hasMultipleTemplates && (
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onPrevTemplate?.()
            }}
            aria-label="Previous meme option"
            title="Previous meme"
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>

          <span className="min-w-[44px] text-center text-xs font-medium text-muted-foreground select-none">
            {currentIndex + 1} / {totalTemplates}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onNextTemplate?.()
            }}
            aria-label="Next meme option"
            title="Next meme"
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
