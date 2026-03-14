"use client"

import { downloadMeme } from "@/lib/memeDownload"
import { MemeTextLayer, Position } from "@/types/meme"
import { useEffect, useRef, useState } from "react"
import useImage from "use-image"

const TEXT_PADDING = 12 // text postion at starting from left,right,up,down
const DEFAULT_TOP_POSITION: Position = { x: TEXT_PADDING, y: 32 } 
const DEFAULT_BOTTOM_POSITION: Position = { x: TEXT_PADDING, y: 556 }
const DEFAULT_FONT_SIZE = 44

function createInitialLayers(bottomY: number): MemeTextLayer[] {
  return [
    { id: "text-1", text: "", fontSize: DEFAULT_FONT_SIZE, position: DEFAULT_TOP_POSITION },
    { id: "text-2", text: "", fontSize: DEFAULT_FONT_SIZE, position: { x: DEFAULT_BOTTOM_POSITION.x, y: bottomY } },
  ]
}

export function useMemeEditor(templateImage: string) {
  const [stageWidth, setStageWidth] = useState(520)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<import("konva/lib/Stage").Stage | null>(null)
  const [image] = useImage(templateImage, "anonymous") //it gives back an HTMLImageElement

  useEffect(() => {
    if (!containerRef.current) return

    const element = containerRef.current
    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? 520
      setStageWidth(Math.max(280, Math.min(nextWidth, 560))) //never smaller than 280 never larger thann 560
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const naturalWidth = image?.width ?? 1200
  const naturalHeight = image?.height ?? 1200
  const aspectRatio = naturalWidth / naturalHeight
  const stageHeight = Math.round(stageWidth / aspectRatio)
  const exportScale = naturalWidth / stageWidth
  const defaultBottomY = Math.max(stageHeight - DEFAULT_FONT_SIZE * 1.25 - 24, 32)
  const nextLayerIndexRef = useRef(3)
  const [textLayers, setTextLayers] = useState<MemeTextLayer[]>(() => createInitialLayers(defaultBottomY))

  function estimateTextBox(text: string, fontSize: number) {  //estimates how much space a piece of text will need.
    const availableWidth = Math.max(stageWidth - TEXT_PADDING * 2, fontSize * 2)
    const estimatedTextWidth = Math.max(fontSize * 2, text.length * fontSize * 0.58)
    const estimatedLines = Math.max(1, Math.ceil(estimatedTextWidth / availableWidth))
    const estimatedTextHeight = estimatedLines * fontSize * 1.05
    const clampedTextWidth = Math.min(estimatedTextWidth, availableWidth)

    return {
      availableWidth,
      estimatedTextHeight,
      estimatedTextWidth: clampedTextWidth,
    }
  }

  function clampPosition(position: Position, text: string, fontSize: number) {   //“Take the position the user wants, but force it to stay inside the allowed area.
    const { estimatedTextHeight, estimatedTextWidth } = estimateTextBox(text, fontSize)

    return {
      x: Math.max(TEXT_PADDING, Math.min(position.x, stageWidth - estimatedTextWidth - TEXT_PADDING)),
      y: Math.max(TEXT_PADDING, Math.min(position.y, stageHeight - estimatedTextHeight - TEXT_PADDING)),
    }
  }

  const visibleTextLayers = textLayers.map((layer, index) => {
    const fallbackPosition =
      index === 0
        ? DEFAULT_TOP_POSITION
        : index === 1
          ? { x: DEFAULT_BOTTOM_POSITION.x, y: defaultBottomY }
          : layer.position

    return {
      ...layer,
      position: clampPosition(layer.text ? layer.position : fallbackPosition, layer.text, layer.fontSize),
    }
  })

  function updateTextLayer(id: string, text: string) { //this updates the text content of one layer.
    setTextLayers((current) =>
      current.map((layer) =>
        layer.id === id
          ? {
              ...layer,
              text,
              position: clampPosition(layer.position, text, layer.fontSize),
            }
          : layer
      )
    )
  }

  function updateTextLayerSize(id: string, fontSize: number) { //  this updates the font size of one text layer.
    setTextLayers((current) =>
      current.map((layer) =>
        layer.id === id
          ? {
              ...layer,
              fontSize,
              position: clampPosition(layer.position, layer.text, fontSize),
            }
          : layer
      )
    )
  }

  function handleTextDrag(id: string, position: Position) {   // called when user drags a text 
    setTextLayers((current) =>
      current.map((layer) =>
        layer.id === id
          ? { ...layer, position: clampPosition(position, layer.text, layer.fontSize) }
          : layer
      )
    )
  }

  function addTextLayer() {
    const nextIndex = nextLayerIndexRef.current
    const centeredPosition = clampPosition(
      {
        x: TEXT_PADDING,
        y:
          Math.max(
            TEXT_PADDING,
            Math.round(stageHeight / 2) - DEFAULT_FONT_SIZE + (nextIndex - 3) * (DEFAULT_FONT_SIZE + 12)
          ),
      },
      "",
      DEFAULT_FONT_SIZE
    )

    setTextLayers((current) => [
      ...current,
      {
        id: `text-${nextIndex}`,
        text: "",
        fontSize: DEFAULT_FONT_SIZE,
        position: centeredPosition,
      },
    ])

    nextLayerIndexRef.current += 1
  }

  function removeTextLayer(id: string) {
    setTextLayers((current) => {
      if (current.length <= 2) return current
      return current.filter((layer) => layer.id !== id)
    })
  }

  function handleReset() {
    setTextLayers(createInitialLayers(defaultBottomY))
    nextLayerIndexRef.current = 3
  }

  function handleDownload() {
    if (!stageRef.current || !image) return

    downloadMeme({
      stage: stageRef.current,
      pixelRatio: exportScale,
    })
  }

  return {
    addTextLayer,
    containerRef,
    handleDownload,
    handleReset,
    handleTextDrag,
    image,
    removeTextLayer,
    stageHeight,
    stageRef,
    stageWidth,
    textLayers: visibleTextLayers,
    updateTextLayer,
    updateTextLayerSize,
  }
}
