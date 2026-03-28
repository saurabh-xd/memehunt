"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import { memes } from "@/data/meme"
import { useActiveTemplate } from "@/context/ActiveTemplateContext"

type TemplatesProps = {
  onTemplateSelect?: () => void
}

export default function Templates({
  onTemplateSelect,
}: TemplatesProps) {
  const [query, setQuery] = useState("")
  const { activeTemplateId, selectGalleryTemplate } = useActiveTemplate()

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

  return (
    <section className="w-full max-w-7xl space-y-5 pb-12">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground/80">
          Explore Templates
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Browse the full meme library
            </h2>
            <p className="text-sm text-muted-foreground">
              Search by template name or vibe and preview every meme image in one place.
            </p>
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredMemes.length} template{filteredMemes.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search templates..."
          className="h-12 w-full rounded-2xl border border-border/70 bg-card/70 pl-11 pr-4 text-sm outline-none transition focus:border-foreground/30"
        />
      </div>

      {filteredMemes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
          No templates matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredMemes.map((meme) => (
            <button
              key={meme.id}
              type="button"
              onClick={() => {
                selectGalleryTemplate(meme)
                onTemplateSelect?.()
              }}
              className={`group overflow-hidden rounded-3xl border bg-card/70 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg cursor-pointer ${
                activeTemplateId === meme.id
                  ? "border-foreground/40 ring-2 ring-foreground/10"
                  : "border-border/70"
              }`}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted/40">
                <Image
                  src={meme.image}
                  alt={meme.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>

              <div className=" px-4 py-3">
                <h3 className="line-clamp-1 text-sm font-semibold text-center text-foreground">
                  {meme.name}
                </h3>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
