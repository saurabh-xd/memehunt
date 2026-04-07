"use client"

import { downloadMeme } from "@/lib/memeDownload"
import { MemeImageLayer, MemeTextLayer, Position } from "@/types/meme"
import { useEffect, useRef, useState } from "react"
import useImage from "use-image"

const TEXT_PADDING = 12
const DEFAULT_TOP_POSITION: Position = { x: TEXT_PADDING, y: 32 }
const DEFAULT_BOTTOM_POSITION: Position = { x: TEXT_PADDING, y: 556 }
const DEFAULT_FONT_SIZE = 33
const MIN_IMAGE_SIZE = 48
const MAX_STAGE_HEIGHT = 400
const MAX_STAGE_WIDTH = 448
const DEFAULT_WATERMARK_TEXT = "MemeHunt"
const DESKTOP_MIN_STAGE_WIDTH = 280
const MOBILE_BREAKPOINT = 640

function getClampedStageWidth(nextWidth: number) {
  if (typeof window === "undefined") {
    return Math.min(Math.max(nextWidth, DESKTOP_MIN_STAGE_WIDTH), MAX_STAGE_WIDTH)
  }

  const isMobileViewport = window.innerWidth < MOBILE_BREAKPOINT

  return Math.min(
    Math.max(nextWidth, isMobileViewport ? 0 : DESKTOP_MIN_STAGE_WIDTH),
    MAX_STAGE_WIDTH
  )
}

function getInitialStageWidth() {
  if (typeof window === "undefined") {
    return 520
  }

  const viewportPadding = window.innerWidth < MOBILE_BREAKPOINT ? 48 : 0
  return getClampedStageWidth(window.innerWidth - viewportPadding)
}

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
  const [stageWidth, setStageWidth] = useState(getInitialStageWidth)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<import("konva/lib/Stage").Stage | null>(null)
  const [image] = useImage(templateImage, "anonymous")
  const nextLayerIndexRef = useRef(3)
  const nextImageLayerIndexRef = useRef(1)

  useEffect(() => {
    if (!containerRef.current) return

    const element = containerRef.current
    const observer = new ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width ?? element.clientWidth ?? 520
      setStageWidth(getClampedStageWidth(nextWidth))
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])



  const naturalWidth = image?.width ?? 1200
  const naturalHeight = image?.height ?? 1200
  const aspectRatio = naturalWidth / naturalHeight
  const calculatedStageHeight = Math.round(stageWidth / aspectRatio)
  const stageHeight = Math.min(calculatedStageHeight, MAX_STAGE_HEIGHT)
  const renderWidth =
    calculatedStageHeight > MAX_STAGE_HEIGHT
      ? Math.round(stageHeight * aspectRatio)
      : stageWidth
  const exportScale = naturalWidth / renderWidth
  const usableStageWidth = renderWidth
  const defaultBottomY = Math.max(stageHeight - DEFAULT_FONT_SIZE * 1.25 - 24, 32)
  const [textLayers, setTextLayers] = useState<MemeTextLayer[]>(() =>
    createInitialLayers(defaultBottomY)
  )
  const [imageLayers, setImageLayers] = useState<MemeImageLayer[]>([])
  const [selectedTextLayerId, setSelectedTextLayerId] = useState<string | null>("text-1")
  const [selectedImageLayerId, setSelectedImageLayerId] = useState<string | null>(null)
  const [showDefaultWatermark, setShowDefaultWatermark] = useState(true)
  const [customWatermark, setCustomWatermark] = useState("")

  function estimateTextBox(text: string, fontSize: number) {
    const availableWidth = Math.max(usableStageWidth - TEXT_PADDING * 2, fontSize * 2)
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
      x: Math.max(TEXT_PADDING, Math.min(position.x, usableStageWidth - estimatedTextWidth - TEXT_PADDING)),
      y: Math.max(TEXT_PADDING, Math.min(position.y, stageHeight - estimatedTextHeight - TEXT_PADDING)),
    }
  }

  function clampImageLayer(layer: MemeImageLayer): MemeImageLayer {
    const width = Math.max(MIN_IMAGE_SIZE, Math.min(layer.width, usableStageWidth - TEXT_PADDING * 2))
    const height = Math.max(MIN_IMAGE_SIZE, Math.min(layer.height, stageHeight - TEXT_PADDING * 2))

    return {
      ...layer,
      width,
      height,
      position: {
        x: Math.max(TEXT_PADDING, Math.min(layer.position.x, usableStageWidth - width - TEXT_PADDING)),
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
    setSelectedTextLayerId(id)
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
    setSelectedTextLayerId(id)
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
    setSelectedTextLayerId(id)
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
    const nextId = `text-${nextIndex}`
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
        id: nextId,
        text: "",
        fontSize: DEFAULT_FONT_SIZE,
        position: centeredPosition,
      },
    ])
    setSelectedTextLayerId(nextId)

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
            x: Math.max(TEXT_PADDING, Math.round((usableStageWidth - width) / 2)),
            y: Math.max(TEXT_PADDING, Math.round((stageHeight - height) / 2)),
          },
        }),
      ])
      setSelectedImageLayerId(`image-${nextImageLayerIndexRef.current}`)

      nextImageLayerIndexRef.current += 1
    } catch {
      URL.revokeObjectURL(src)
    }
  }

  function removeTextLayer(id: string) {
    setTextLayers((current) => {
      if (current.length <= 2) return current
      const nextLayers = current.filter((layer) => layer.id !== id)
      setSelectedTextLayerId((selectedId) =>
        selectedId === id ? (nextLayers[0]?.id ?? null) : selectedId
      )
      return nextLayers
    })
  }

  function removeImageLayer(id: string) {
    setImageLayers((current) => {
      const target = current.find((layer) => layer.id === id)
      if (target) {
        URL.revokeObjectURL(target.src)
      }

      setSelectedImageLayerId((selectedId) => (selectedId === id ? null : selectedId))
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
    setShowDefaultWatermark(true)
    setCustomWatermark("")
    setSelectedTextLayerId("text-1")
    setSelectedImageLayerId(null)
    nextLayerIndexRef.current = 3
    nextImageLayerIndexRef.current = 1
  }

  const selectedTextLayer =
    visibleTextLayers.find((layer) => layer.id === selectedTextLayerId) ??
    visibleTextLayers[0] ??
    null
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
    customWatermark,
    defaultWatermarkText: DEFAULT_WATERMARK_TEXT,
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
    stageWidth: renderWidth,
    textLayers: visibleTextLayers,
    updateTextLayer,
    updateTextLayerSize,
  }
}
