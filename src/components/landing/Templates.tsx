"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import { useActiveTemplate } from "@/context/ActiveTemplateContext"
import type { MemeResult } from "@/types/meme"
import type { MemeApiErrorResponse, MemeTemplatesResponse } from "@/types/api"

const PAGE_SIZE = 20

type TemplatesProps = {
  onTemplateSelect?: () => void
}

export default function Templates({
  onTemplateSelect,
}: TemplatesProps) {
  const [query, setQuery] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [memes, setMemes] = useState<MemeResult[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)
  const [templatesError, setTemplatesError] = useState("")
  const [failedImageIds, setFailedImageIds] = useState<string[]>([])
  const { activeTemplateId, selectGalleryTemplate } = useActiveTemplate()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let isActive = true

    async function loadTemplates() {
      try {
        setIsLoadingTemplates(true)
        setTemplatesError("")

        const response = await fetch("/api/memes", {
          cache: "no-store",
        })

        if (!response.ok) {
          const errorBody = (await response.json()) as MemeApiErrorResponse
          throw new Error(errorBody.error || "Unable to load meme templates")
        }

        const data = (await response.json()) as MemeTemplatesResponse

        if (!isActive) {
          return
        }

        setMemes(data)
      } catch (error) {
        if (!isActive) {
          return
        }

        const message =
          error instanceof Error ? error.message : "Unable to load meme templates"

        setTemplatesError(message)
      } finally {
        if (isActive) {
          setIsLoadingTemplates(false)
        }
      }
    }

    loadTemplates()

    return () => {
      isActive = false
    }
  }, [])

  const filteredMemes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const enabledMemes = memes.filter(
      (meme) => meme.selectionEnabled !== false && !failedImageIds.includes(meme.id)
    )

    if (!normalizedQuery) {
      return enabledMemes
    }

    return enabledMemes.filter((meme) =>
      [meme.name, meme.description, meme.selectionNotes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [failedImageIds, memes, query])

  const visibleMemes = filteredMemes.slice(0, visibleCount)
  const hasMoreTemplates = visibleCount < filteredMemes.length

  useEffect(() => {
    const target = loadMoreRef.current
    if (!target || !hasMoreTemplates) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredMemes.length))
        }
      },
      {
        rootMargin: "200px 0px",
      }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [filteredMemes.length, hasMoreTemplates])

  return (
    <section id="templates" className="w-full max-w-7xl space-y-4 px-1 pb-10 sm:space-y-5 sm:pb-12">
      <div className="flex flex-col justify-center gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/80 sm:text-sm sm:tracking-[0.24em]">
          Explore Templates
        </p>
         <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setVisibleCount(PAGE_SIZE)
          }}
          placeholder="Search templates..."
          className="h-11 w-full rounded-2xl border border-border/70 bg-card/70 pl-11 pr-4 text-sm outline-none transition focus:border-foreground/30 sm:h-12"
        />
      </div>
      </div>

      {isLoadingTemplates ? (
        <div className="rounded-3xl border border-border/70 bg-card/50 px-5 py-10 text-center text-sm text-muted-foreground sm:px-6 sm:py-12">
          Loading templates...
        </div>
      ) : templatesError ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 px-5 py-10 text-center text-sm text-destructive sm:px-6 sm:py-12">
          {templatesError}
        </div>
      ) : visibleMemes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/50 px-5 py-10 text-center text-sm text-muted-foreground sm:px-6 sm:py-12">
          No templates matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5 xl:gap-6">
          {visibleMemes.map((meme) => (
            <button
              key={meme.id}
              type="button"
              onClick={() => {
                selectGalleryTemplate(meme)
                onTemplateSelect?.()
              }}
              className={`group overflow-hidden  rounded-xl text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg cursor-pointer sm:h-52 lg:h-60 ${
                activeTemplateId === meme.id
                  ? "border-foreground/40 ring-2 ring-foreground/10"
                  : "border-border/70"
              }`}
            >
              <div className="relative aspect-square overflow-hidden bg-muted/40">
                <Image
                  src={meme.image}
                  alt={meme.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  className="object-cover transition duration-300"
                  onError={() => {
                    setFailedImageIds((current) =>
                      current.includes(meme.id) ? current : [...current, meme.id]
                    )
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {!isLoadingTemplates && !templatesError && hasMoreTemplates && (
        <div ref={loadMoreRef} className="flex justify-center py-4 sm:py-6">
          <div className="rounded-full border border-border/70 bg-card/60 px-4 py-2 text-xs text-muted-foreground sm:text-sm">
            Loading more templates...
          </div>
        </div>
      )}
    </section>
  )
}
