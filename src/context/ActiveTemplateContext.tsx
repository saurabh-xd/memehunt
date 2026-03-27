"use client"

import { MemeResult } from "@/types/meme"
import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react"

type ActiveTemplateContextValue = {
  selectedTemplate: MemeResult | null
  setSelectedTemplate: (template: MemeResult) => void
  clearSelectedTemplate: () => void
}

const ActiveTemplateContext = createContext<ActiveTemplateContextValue | null>(null)

export function ActiveTemplateProvider({ children }: { children: ReactNode }) {
  const [selectedTemplate, setSelectedTemplateState] = useState<MemeResult | null>(null)

  function setSelectedTemplate(template: MemeResult) {
    setSelectedTemplateState(template)
  }

  function clearSelectedTemplate() {
    setSelectedTemplateState(null)
  }

  const value = useMemo(
    () => ({
      selectedTemplate,
      setSelectedTemplate,
      clearSelectedTemplate,
    }),
    [selectedTemplate]
  )

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
