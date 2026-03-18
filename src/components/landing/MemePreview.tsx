"use client"

import { MemeTextLayer } from "@/types/meme"
import { useState } from "react"
import type { RefObject } from "react"
import { Image as KonvaImage, Layer, Stage, Text } from "react-konva"

type Props = {
  image: HTMLImageElement | undefined
  containerRef: RefObject<HTMLDivElement | null>
  stageRef: RefObject<import("konva/lib/Stage").Stage | null>
  stageWidth: number
  stageHeight: number
  textLayers: MemeTextLayer[]
  onTextDrag: (id: string, position: { x: number; y: number }) => void
}

export default function MemePreview({
  image,
  containerRef,
  stageRef,
  stageWidth,
  stageHeight,
  textLayers,
  onTextDrag,
}: Props) {
  const [activeTextId, setActiveTextId] = useState<string | null>(null)

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
        >
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                width={stageWidth}
                height={stageHeight}
              />
            )}
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
                onDragStart={() => setActiveTextId(layer.id)}
                onDragMove={(event: { target: { x: () => number; y: () => number } }) =>
                  onTextDrag(layer.id, { x: event.target.x(), y: event.target.y() })
                }
                onDragEnd={() => setActiveTextId(null)}
                onMouseEnter={() => setStageCursor("pointer")}
                onMouseLeave={() => setStageCursor("default")}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
