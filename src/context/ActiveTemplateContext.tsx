"use client"

import { MemeResult } from "@/types/meme"
import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react"

type ActiveTemplateSource = "gallery" | "ai" | "custom" | null

type ActiveTemplateContextValue = {
  activeTemplate: MemeResult | null
  activeTemplateName: string | null
  activeTemplateImage: string | null
  activeTemplateId: string | null
  activeTemplateSource: ActiveTemplateSource
  hasActiveTemplate: boolean
  selectGalleryTemplate: (template: MemeResult) => void
  selectGeneratedTemplate: (template: MemeResult) => void
  selectCustomTemplate: (image: string, name: string) => void
  clearActiveTemplate: () => void
}

const ActiveTemplateContext = createContext<ActiveTemplateContextValue | null>(null)

export function ActiveTemplateProvider({ children }: { children: ReactNode }) {
  const [activeTemplate, setActiveTemplate] = useState<MemeResult | null>(null)
  const [activeTemplateSource, setActiveTemplateSource] = useState<ActiveTemplateSource>(null)
  const [customTemplateImage, setCustomTemplateImage] = useState<string | null>(null)
  const [customTemplateName, setCustomTemplateName] = useState<string | null>(null)

  function clearCustomTemplate() {
    if (customTemplateImage) {
      URL.revokeObjectURL(customTemplateImage)
    }

    setCustomTemplateImage(null)
    setCustomTemplateName(null)
  }

  function selectGalleryTemplate(template: MemeResult) {
    clearCustomTemplate()
    setActiveTemplate(template)
    setActiveTemplateSource("gallery")
  }

  function selectGeneratedTemplate(template: MemeResult) {
    clearCustomTemplate()
    setActiveTemplate(template)
    setActiveTemplateSource("ai")
  }

  function selectCustomTemplate(image: string, name: string) {
    clearCustomTemplate()
    setActiveTemplate(null)
    setCustomTemplateImage(image)
    setCustomTemplateName(name)
    setActiveTemplateSource("custom")
  }

  function clearActiveTemplate() {
    clearCustomTemplate()
    setActiveTemplate(null)
    setActiveTemplateSource(null)
  }

  const activeTemplateImage = customTemplateImage ?? activeTemplate?.image ?? null
  const activeTemplateName = customTemplateName ?? activeTemplate?.name ?? null
  const activeTemplateId = activeTemplate?.id ?? null
  const hasActiveTemplate = Boolean(activeTemplateImage)

  const value = {
    activeTemplate,
    activeTemplateName,
    activeTemplateImage,
    activeTemplateId,
    activeTemplateSource,
    hasActiveTemplate,
    selectGalleryTemplate,
    selectGeneratedTemplate,
    selectCustomTemplate,
    clearActiveTemplate,
  }

  return (
    <ActiveTemplateContext.Provider value={value}>
      {children}
    </ActiveTemplateContext.Provider>
  )
}

export function useActiveTemplate() {
  const context = useContext(ActiveTemplateContext)

  if (!context) {
    throw new Error("useActiveTemplate must be used inside ActiveTemplateProvider")
  }

  return context
}
