"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import { memes } from "@/data/meme"
import { useActiveTemplate } from "@/context/ActiveTemplateContext"

const PAGE_SIZE = 20

type TemplatesProps = {
  onTemplateSelect?: () => void
}

export default function Templates({
  onTemplateSelect,
}: TemplatesProps) {
  const [query, setQuery] = useState("")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const { activeTemplateId, selectGalleryTemplate } = useActiveTemplate()
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const filteredMemes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const enabledMemes = memes.filter((meme) => meme.selectionEnabled !== false)

    if (!normalizedQuery) {
      return enabledMemes
    }

    return enabledMemes.filter((meme) =>
      [meme.name, meme.description, meme.selectionNotes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    )
  }, [query])

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
    <section id="templates" className="w-full max-w-7xl space-y-5 pb-12">
      <div className="flex flex-col gap-2 justify-center">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground/80">
          Explore Templates
        </p>
         <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setVisibleCount(PAGE_SIZE)
          }}
          placeholder="Search templates..."
          className="h-12 w-full rounded-2xl border border-border/70 bg-card/70 pl-11 pr-4 text-sm outline-none transition focus:border-foreground/30"
        />
      </div>
      </div>

     

      {visibleMemes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
          No templates matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visibleMemes.map((meme) => (
            <button
              key={meme.id}
              type="button"
              onClick={() => {
                selectGalleryTemplate(meme)
                onTemplateSelect?.()
              }}
              className={`group overflow-hidden h-60 rounded-xl border bg-card/70 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
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
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {hasMoreTemplates && (
        <div ref={loadMoreRef} className="flex justify-center py-6">
          <div className="rounded-full border border-border/70 bg-card/60 px-4 py-2 text-sm text-muted-foreground">
            Loading more templates...
          </div>
        </div>
      )}
    </section>
  )
}
