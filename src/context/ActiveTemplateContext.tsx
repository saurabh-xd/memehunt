"use client"

import { MemeResult } from "@/types/meme"
import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react"
import { trackEvent } from "@/lib/gtag"

type ActiveTemplateSource = "gallery" | "ai" | "custom" | null

type ActiveTemplateContextValue = {
  activeTemplate: MemeResult | null
  activeTemplateName: string | null
  activeTemplateImage: string | null
  activeTemplateId: string | null
  activeTemplateSource: ActiveTemplateSource
  hasActiveTemplate: boolean
  generatedTemplates: MemeResult[]
  activeGeneratedIndex: number
  hasMultipleGeneratedTemplates: boolean
  goToNextGeneratedTemplate: () => void
  goToPrevGeneratedTemplate: () => void
  selectGeneratedTemplateByIndex: (index: number) => void
  selectGalleryTemplate: (template: MemeResult) => void
  selectGeneratedTemplate: (template: MemeResult) => void
  selectGeneratedTemplates: (templates: MemeResult[], initialIndex?: number) => void
  selectCustomTemplate: (image: string, name: string) => void
  clearActiveTemplate: () => void
}

const ActiveTemplateContext = createContext<ActiveTemplateContextValue | null>(null)

export function ActiveTemplateProvider({ children }: { children: ReactNode }) {
  const [activeTemplate, setActiveTemplate] = useState<MemeResult | null>(null)
  const [activeTemplateSource, setActiveTemplateSource] = useState<ActiveTemplateSource>(null)
  const [customTemplateImage, setCustomTemplateImage] = useState<string | null>(null)
  const [customTemplateName, setCustomTemplateName] = useState<string | null>(null)
  const [generatedTemplates, setGeneratedTemplates] = useState<MemeResult[]>([])
  const [activeGeneratedIndex, setActiveGeneratedIndex] = useState(0)

  function clearCustomTemplate() {
    if (customTemplateImage) {
      URL.revokeObjectURL(customTemplateImage)
    }

    setCustomTemplateImage(null)
    setCustomTemplateName(null)
  }

  function selectGalleryTemplate(template: MemeResult) {
    clearCustomTemplate()
    setGeneratedTemplates([])
    setActiveGeneratedIndex(0)
    setActiveTemplate(template)
    setActiveTemplateSource("gallery")
    trackEvent({
      action: "select_gallery_template",
      category: "Meme",
      label: template.name,
    })
  }

  function selectGeneratedTemplate(template: MemeResult) {
    clearCustomTemplate()
    setGeneratedTemplates([template])
    setActiveGeneratedIndex(0)
    setActiveTemplate(template)
    setActiveTemplateSource("ai")
  }

  function selectGeneratedTemplates(templates: MemeResult[], initialIndex = 0) {
    clearCustomTemplate()
    setGeneratedTemplates(templates)
    const validIndex = Math.max(0, Math.min(initialIndex, templates.length - 1))
    setActiveGeneratedIndex(validIndex)
    setActiveTemplate(templates[validIndex] ?? null)
    setActiveTemplateSource("ai")
  }

  function goToNextGeneratedTemplate() {
    if (generatedTemplates.length <= 1) return
    const nextIndex = (activeGeneratedIndex + 1) % generatedTemplates.length
    setActiveGeneratedIndex(nextIndex)
    const nextTemplate = generatedTemplates[nextIndex]
    setActiveTemplate(nextTemplate)
    trackEvent({
      action: "switch_template_alternative",
      category: "Meme",
      direction: "next",
      template_name: nextTemplate?.name,
      index: nextIndex + 1,
    })
  }

  function goToPrevGeneratedTemplate() {
    if (generatedTemplates.length <= 1) return
    const prevIndex = (activeGeneratedIndex - 1 + generatedTemplates.length) % generatedTemplates.length
    setActiveGeneratedIndex(prevIndex)
    const prevTemplate = generatedTemplates[prevIndex]
    setActiveTemplate(prevTemplate)
    trackEvent({
      action: "switch_template_alternative",
      category: "Meme",
      direction: "prev",
      template_name: prevTemplate?.name,
      index: prevIndex + 1,
    })
  }

  function selectGeneratedTemplateByIndex(index: number) {
    if (index >= 0 && index < generatedTemplates.length) {
      setActiveGeneratedIndex(index)
      setActiveTemplate(generatedTemplates[index])
    }
  }

  function selectCustomTemplate(image: string, name: string) {
    clearCustomTemplate()
    setGeneratedTemplates([])
    setActiveGeneratedIndex(0)
    setActiveTemplate(null)
    setCustomTemplateImage(image)
    setCustomTemplateName(name)
    setActiveTemplateSource("custom")
  }

  function clearActiveTemplate() {
    clearCustomTemplate()
    setGeneratedTemplates([])
    setActiveGeneratedIndex(0)
    setActiveTemplate(null)
    setActiveTemplateSource(null)
  }

  const activeTemplateImage = customTemplateImage ?? activeTemplate?.image ?? null
  const activeTemplateName = customTemplateName ?? activeTemplate?.name ?? null
  const activeTemplateId = activeTemplate?.id ?? null
  const hasActiveTemplate = Boolean(activeTemplateImage)
  const hasMultipleGeneratedTemplates =
    activeTemplateSource === "ai" && generatedTemplates.length > 1

  const value = {
    activeTemplate,
    activeTemplateName,
    activeTemplateImage,
    activeTemplateId,
    activeTemplateSource,
    hasActiveTemplate,
    generatedTemplates,
    activeGeneratedIndex,
    hasMultipleGeneratedTemplates,
    goToNextGeneratedTemplate,
    goToPrevGeneratedTemplate,
    selectGeneratedTemplateByIndex,
    selectGalleryTemplate,
    selectGeneratedTemplate,
    selectGeneratedTemplates,
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
