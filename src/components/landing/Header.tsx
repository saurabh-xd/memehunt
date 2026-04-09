"use client"
import { LineShadowText } from '../ui/line-shadow-text'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function Header() {
  const theme = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    
    setMounted(true)
  }, [])

  const shadowColor = mounted && theme.resolvedTheme === "dark" ? "white" : "black"

  return (
    <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
         Find a meme that actually <LineShadowText className="italic" shadowColor={shadowColor}>
        Fits
      </LineShadowText>
        </h1>
        <p className="max-w-lg text-pretty text-sm font-medium leading-6 text-muted-foreground/90 sm:text-base">
          Describe the situation let AI find the closest meme then edit it your way
        </p>
      </div>
  )
}
