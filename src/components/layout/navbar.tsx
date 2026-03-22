"use client"
import { Button } from "../ui/button"
import { ModeToggle } from "../common/theme_toggle"
import { signOut, useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function Navbar() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between px-3 py-4">
      <button
        type="button"
        onClick={() => router.push("/")}
        className="text-lg font-bold tracking-tight"
      >
        MemeHunt
      </button>

      <div className="flex items-center gap-3">
        <ModeToggle />

        {isPending ? (
          <div className="flex h-10 min-w-28 items-center justify-center rounded-full border border-border/70 px-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : session?.user ? (
         
            
            <Button
              variant="outline"
              className="rounded-full cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
         
        ) : (
          <Button className="rounded-full cursor-pointer" onClick={() => router.push("/sign-in")}>
            Sign In
          </Button>
        )}
      </div>
    </div>
  )
}
