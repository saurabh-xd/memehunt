"use client"

import { ActiveTemplateProvider } from "@/context/ActiveTemplateContext"
import { ReactNode } from "react"
import { ThemeProvider } from "../common/theme-provider"
import { TooltipProvider } from "../ui/tooltip"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
     
      <ActiveTemplateProvider>
         <TooltipProvider>
        {children}
        </TooltipProvider>
      </ActiveTemplateProvider>
    </ThemeProvider>
  )
}
