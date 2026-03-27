"use client"

import { ActiveTemplateProvider } from "@/context/ActiveTemplateContext"
import { ReactNode } from "react"
import { ThemeProvider } from "../common/theme-provider"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ActiveTemplateProvider>
        {children}
      </ActiveTemplateProvider>
    </ThemeProvider>
  )
}
