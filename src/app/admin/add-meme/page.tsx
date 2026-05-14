import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { AdminAddMemeForm } from "@/components/admin/admin-add-meme-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireAdmin } from "@/lib/auth-helpers"

export default async function AdminMemesPage() {
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

  const [totalCount, enabledCount] = await Promise.all([
    prisma.memeTemplate.count(),
    prisma.memeTemplate.count({
      where: { selectionEnabled: true },
    }),
  ])

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground/75">
            Admin / Content
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Add meme template
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              A simple internal form for adding new templates to the database. Use a Cloudinary image URL, write clear metadata, and the meme becomes available to the app.
            </p>
          </div>
          <div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/memes">Manage existing memes</Link>
            </Button>
          </div>
        </div>

        <div className="flex gap-3 text-sm">
          <div className="rounded-full border border-border/70 bg-card/60 px-4 py-2 text-muted-foreground">
            {totalCount} total
          </div>
          <div className="rounded-full border border-border/70 bg-card/60 px-4 py-2 text-muted-foreground">
            {enabledCount} enabled
          </div>
        </div>

        <Card className="gap-0 border border-border/70 bg-card/80 backdrop-blur-sm">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Template details</CardTitle>
            <CardDescription>
              This writes directly to the `MemeTemplate` table. Keep IDs stable, descriptions useful, and tags short.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <AdminAddMemeForm />
          </CardContent>
        </Card>

        <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 px-5 py-4 text-sm text-muted-foreground">
          Suggested workflow:
          Upload right here or paste an existing Cloudinary URL, write description + selection notes, then tag it for future filtering.
        </div>
      </section>
    </main>
  )
}
