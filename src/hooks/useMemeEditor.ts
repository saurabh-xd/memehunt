"use client"

import { downloadMeme } from "@/lib/memeDownload"
import { MemeImageLayer, MemeTextLayer, Position } from "@/types/meme"
import { useEffect, useRef, useState } from "react"
import useImage from "use-image"

const TEXT_PADDING = 12
const DEFAULT_TOP_POSITION: Position = { x: TEXT_PADDING, y: 32 }
const DEFAULT_BOTTOM_POSITION: Position = { x: TEXT_PADDING, y: 556 }
const DEFAULT_FONT_SIZE = 44
const MIN_IMAGE_SIZE = 48

function createInitialLayers(bottomY: number): MemeTextLayer[] {
  return [
    {
      id: "text-1",
      text: "",
      fontSize: DEFAULT_FONT_SIZE,
      position: DEFAULT_TOP_POSITION,
    },
    {
      id: "text-2",
      text: "",
      fontSize: DEFAULT_FONT_SIZE,
      position: { x: DEFAULT_BOTTOM_POSITION.x, y: bottomY },
    },
  ]
}

export function useMemeEditor(templateImage: string) {
  const [stageWidth, setStageWidth] = useState(520)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<import("konva/lib/Stage").Stage | null>(null)
  const [image] = useImage(templateImage, "anonymous")
  const nextLayerIndexRef = useRef(3)
  const nextImageLayerIndexRef = useRef(1)

  useEffect(() => {
    if (!containerRef.current) return

    const element = containerRef.current
    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? 520
      setStageWidth(Math.max(280, Math.min(nextWidth, 700)))
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
  const [textLayers, setTextLayers] = useState<MemeTextLayer[]>(() =>
    createInitialLayers(defaultBottomY)
  )
  const [imageLayers, setImageLayers] = useState<MemeImageLayer[]>([])

  function estimateTextBox(text: string, fontSize: number) {
    const availableWidth = Math.max(stageWidth - TEXT_PADDING * 2, fontSize * 2)
    const estimatedTextWidth = Math.max(fontSize * 2, text.length * fontSize * 0.58)
    const estimatedLines = Math.max(1, Math.ceil(estimatedTextWidth / availableWidth))
    const estimatedTextHeight = estimatedLines * fontSize * 1.05
    const clampedTextWidth = Math.min(estimatedTextWidth, availableWidth)

    return {
      estimatedTextHeight,
      estimatedTextWidth: clampedTextWidth,
    }
  }

  function clampTextPosition(position: Position, text: string, fontSize: number) {
    const { estimatedTextHeight, estimatedTextWidth } = estimateTextBox(text, fontSize)

    return {
      x: Math.max(TEXT_PADDING, Math.min(position.x, stageWidth - estimatedTextWidth - TEXT_PADDING)),
      y: Math.max(TEXT_PADDING, Math.min(position.y, stageHeight - estimatedTextHeight - TEXT_PADDING)),
    }
  }

  function clampImageLayer(layer: MemeImageLayer): MemeImageLayer {
    const width = Math.max(MIN_IMAGE_SIZE, Math.min(layer.width, stageWidth - TEXT_PADDING * 2))
    const height = Math.max(MIN_IMAGE_SIZE, Math.min(layer.height, stageHeight - TEXT_PADDING * 2))

    return {
      ...layer,
      width,
      height,
      position: {
        x: Math.max(TEXT_PADDING, Math.min(layer.position.x, stageWidth - width - TEXT_PADDING)),
        y: Math.max(TEXT_PADDING, Math.min(layer.position.y, stageHeight - height - TEXT_PADDING)),
      },
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
      position: clampTextPosition(
        layer.text ? layer.position : fallbackPosition,
        layer.text,
        layer.fontSize
      ),
    }
  })

  const visibleImageLayers = imageLayers.map((layer) => clampImageLayer(layer))

  function updateTextLayer(id: string, text: string) {
    setTextLayers((current) =>
      current.map((layer) =>
        layer.id === id
          ? {
              ...layer,
              text,
              position: clampTextPosition(layer.position, text, layer.fontSize),
            }
          : layer
      )
    )
  }

  function updateTextLayerSize(id: string, fontSize: number) {
    setTextLayers((current) =>
      current.map((layer) =>
        layer.id === id
          ? {
              ...layer,
              fontSize,
              position: clampTextPosition(layer.position, layer.text, fontSize),
            }
          : layer
      )
    )
  }

  function handleTextDrag(id: string, position: Position) {
    setTextLayers((current) =>
      current.map((layer) =>
        layer.id === id
          ? { ...layer, position: clampTextPosition(position, layer.text, layer.fontSize) }
          : layer
      )
    )
  }

  function addTextLayer() {
    const nextIndex = nextLayerIndexRef.current
    const centeredPosition = clampTextPosition(
      {
        x: TEXT_PADDING,
        y: Math.max(
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

  async function addImageLayer(file: File) {
    const src = URL.createObjectURL(file)

    try {
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const previewImage = new window.Image()
        previewImage.onload = () =>
          resolve({ width: previewImage.width, height: previewImage.height })
        previewImage.onerror = () => reject(new Error("Unable to load image"))
        previewImage.src = src
      })

      const maxWidth = Math.max(140, Math.round(stageWidth * 0.38))
      const width = Math.min(maxWidth, dimensions.width)
      const height = Math.max(
        MIN_IMAGE_SIZE,
        Math.round((width / dimensions.width) * dimensions.height)
      )

      setImageLayers((current) => [
        ...current,
        clampImageLayer({
          id: `image-${nextImageLayerIndexRef.current}`,
          src,
          width,
          height,
          position: {
            x: Math.max(TEXT_PADDING, Math.round((stageWidth - width) / 2)),
            y: Math.max(TEXT_PADDING, Math.round((stageHeight - height) / 2)),
          },
        }),
      ])

      nextImageLayerIndexRef.current += 1
    } catch {
      URL.revokeObjectURL(src)
    }
  }

  function removeTextLayer(id: string) {
    setTextLayers((current) => {
      if (current.length <= 2) return current
      return current.filter((layer) => layer.id !== id)
    })
  }

  function removeImageLayer(id: string) {
    setImageLayers((current) => {
      const target = current.find((layer) => layer.id === id)
      if (target) {
        URL.revokeObjectURL(target.src)
      }

      return current.filter((layer) => layer.id !== id)
    })
  }

  function handleImageDrag(id: string, position: Position) {
    setImageLayers((current) =>
      current.map((layer) =>
        layer.id === id
          ? clampImageLayer({
              ...layer,
              position,
            })
          : layer
      )
    )
  }

  function handleImageResize(
    id: string,
    size: { width: number; height: number; x: number; y: number }
  ) {
    setImageLayers((current) =>
      current.map((layer) =>
        layer.id === id
          ? clampImageLayer({
              ...layer,
              width: size.width,
              height: size.height,
              position: { x: size.x, y: size.y },
            })
          : layer
      )
    )
  }

  function handleReset() {
    setTextLayers(createInitialLayers(defaultBottomY))
    setImageLayers((current) => {
      current.forEach((layer) => URL.revokeObjectURL(layer.src))
      return []
    })
    nextLayerIndexRef.current = 3
    nextImageLayerIndexRef.current = 1
  }

  useEffect(() => {
    return () => {
      imageLayers.forEach((layer) => URL.revokeObjectURL(layer.src))
    }
  }, [imageLayers])

  function handleDownload() {
    if (!stageRef.current || !image) return

    downloadMeme({
      stage: stageRef.current,
      pixelRatio: exportScale,
    })
  }

  return {
    addImageLayer,
    addTextLayer,
    containerRef,
    handleDownload,
    handleImageDrag,
    handleImageResize,
    handleReset,
    handleTextDrag,
    image,
    imageLayers: visibleImageLayers,
    removeImageLayer,
    removeTextLayer,
    stageHeight,
    stageRef,
    stageWidth,
    textLayers: visibleTextLayers,
    updateTextLayer,
    updateTextLayerSize,
  }
}
