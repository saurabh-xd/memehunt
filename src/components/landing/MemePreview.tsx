"use client"

import Konva from "konva"
import { useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { Image as KonvaImage, Layer, Stage, Text, Transformer } from "react-konva"
import useImage from "use-image"
import { MemeImageLayer, MemeTextLayer } from "@/types/meme"

type Props = {
  image: HTMLImageElement | undefined
  containerRef: RefObject<HTMLDivElement | null>
  stageRef: RefObject<import("konva/lib/Stage").Stage | null>
  stageWidth: number
  stageHeight: number
  textLayers: MemeTextLayer[]
  imageLayers: MemeImageLayer[]
  onTextDrag: (id: string, position: { x: number; y: number }) => void
  onImageDrag: (id: string, position: { x: number; y: number }) => void
  onImageResize: (id: string, size: { width: number; height: number; x: number; y: number }) => void
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
  containerRef,
  stageRef,
  stageWidth,
  stageHeight,
  textLayers,
  imageLayers,
  onTextDrag,
  onImageDrag,
  onImageResize,
}: Props) {
  const [activeTextId, setActiveTextId] = useState<string | null>(null)
  const [activeImageId, setActiveImageId] = useState<string | null>(null)

  function setStageCursor(cursor: string) {
    const stage = stageRef.current
    if (!stage) return
    stage.container().style.cursor = cursor
  }

  const sharedTextProps = {
    fontFamily: "Impact, Arial Black, sans-serif",
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

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[560px] rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.16),_transparent_58%),linear-gradient(180deg,rgba(15,23,42,0.06),rgba(15,23,42,0.02))] p-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.6)]"
    >
      <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-black/5">
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          className="mx-auto"
          onMouseDown={(event) => {
            if (event.target === event.target.getStage()) {
              setActiveImageId(null)
              setActiveTextId(null)
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
                isSelected={activeImageId === layer.id}
                onSelect={() => {
                  setActiveTextId(null)
                  setActiveImageId(layer.id)
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
                opacity={activeTextId === layer.id ? 0.88 : 1}
                scaleX={activeTextId === layer.id ? 1.02 : 1}
                scaleY={activeTextId === layer.id ? 1.02 : 1}
                draggable
                onDragStart={() => {
                  setActiveImageId(null)
                  setActiveTextId(layer.id)
                }}
                onDragMove={(event) =>
                  onTextDrag(layer.id, { x: event.target.x(), y: event.target.y() })
                }
                onDragEnd={() => setActiveTextId(null)}
                onMouseEnter={() => setStageCursor("pointer")}
                onMouseLeave={() => setStageCursor("default")}
                onClick={() => setActiveImageId(null)}
                onTap={() => setActiveImageId(null)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
