import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminMemeEditorCard } from "@/components/admin/admin-meme-editor-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { requireAdmin } from "@/lib/auth-helpers"

type AdminMemesPageProps = {
  searchParams?: Promise<{
    q?: string
  }>
}

export default async function AdminMemesPage({ searchParams }: AdminMemesPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/sign-in")
  }

    try {
        await requireAdmin()
     } catch {
      redirect("/")
     }

  const resolvedSearchParams = searchParams ? await searchParams : {}
  const query = resolvedSearchParams.q?.trim() ?? ""

  const memes = await prisma.memeTemplate.findMany({
    where: query
      ? {
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { tags: { has: query.toLowerCase() } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 40,
  })

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground/75">
            Admin / Content
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Manage memes
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Search existing templates, edit metadata inline, and quickly toggle whether a meme is available for AI selection.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/admin/add-meme">Add new meme</Link>
            </Button>
          </div>
        </div>

        <Card className="gap-0 border border-border/70 bg-card/80">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Find a template</CardTitle>
            <CardDescription>
              Search by meme ID, name, description, or a single tag. Showing up to 40 recent matches.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="flex flex-col gap-3 sm:flex-row">
              <Input
                name="q"
                defaultValue={query}
                placeholder="Search drake, office, chaos..."
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {memes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 px-5 py-10 text-center text-sm text-muted-foreground">
              No meme templates matched this search.
            </div>
          ) : (
            memes.map((meme) => <AdminMemeEditorCard key={meme.id} meme={meme} />)
          )}
        </div>
      </section>
    </main>
  )
}
