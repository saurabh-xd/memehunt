import React from 'react'

export default function Header() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          AI Meme Finder
        </h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Describe any situation and let AI find the perfect meme.
        </p>
      </div>
  )
}
