"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import { memes } from "@/data/meme"
import { useActiveTemplate } from "@/context/ActiveTemplateContext"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const PAGE_SIZE = 20

type TemplatesProps = {
  onTemplateSelect?: () => void
}

export default function Templates({
  onTemplateSelect,
}: TemplatesProps) {

  const [currentPage, setCurrentPage] = useState(1)
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

  const totalPages = Math.max(1, Math.ceil(filteredMemes.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
  const visibleMemes = filteredMemes.slice(startIndex, startIndex + PAGE_SIZE)

  const pageItems = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1)
    }

    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis", totalPages]
    }

    if (safeCurrentPage >= totalPages - 2) {
      return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, "ellipsis", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "ellipsis", totalPages]
  }, [safeCurrentPage, totalPages])

  return (
    <section className="w-full max-w-7xl space-y-5 pb-12">
      <div >
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground/80">
          Explore Templates
        </p>
       
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setCurrentPage(1)
          }}
          placeholder="Search templates..."
          className="h-12 w-full rounded-2xl border border-border/70 bg-card/70 pl-11 pr-4 text-sm outline-none transition focus:border-foreground/30"
        />
      </div>

      {visibleMemes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
          No templates matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
              <div className="relative aspect-[4/5] overflow-hidden bg-muted/40">
                <Image
                  src={meme.image}
                  alt={meme.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  className="object-cover transition duration-300 "
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

      {filteredMemes.length > PAGE_SIZE && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#templates"
                aria-disabled={safeCurrentPage === 1}
                className={safeCurrentPage === 1 ? "pointer-events-none opacity-40" : ""}
                onClick={(event) => {
                  event.preventDefault()
                  if (safeCurrentPage === 1) return
                  setCurrentPage((page) => Math.max(1, page - 1))
                }}
              />
            </PaginationItem>

            {pageItems.map((item, index) => (
              <PaginationItem key={`${item}-${index}`}>
                {item === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#templates"
                    isActive={safeCurrentPage === item}
                    onClick={(event) => {
                      event.preventDefault()
                      setCurrentPage(item as number)
                    }}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#templates"
                aria-disabled={safeCurrentPage === totalPages}
                className={safeCurrentPage === totalPages ? "pointer-events-none opacity-40" : ""}
                onClick={(event) => {
                  event.preventDefault()
                  if (safeCurrentPage === totalPages) return
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  )
}
