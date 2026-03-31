"use client"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { ModeToggle } from "../common/theme_toggle"
import { signOut, useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import {  Loader2 } from "lucide-react"
import { GithubIcon } from "../githubIcon"
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import Link from "next/link"

export default function Navbar() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadStars() {
      try {
        const response = await fetch("https://api.github.com/repos/saurabh-xd/chatMate")
        if (!response.ok) return

        const data = await response.json()
        if (isMounted && typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count)
        }
      } catch {
        // Keep the button usable even if GitHub is unreachable.
      }
    }

    loadStars()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSignOut() {
    await signOut()
    router.refresh()
  }

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <Link
       href="/"
        className="cursor-pointer text-lg font-bold tracking-tight"
      >
       MemeHunt AI
      </Link>

      <div className="flex items-center gap-3">

 <ModeToggle />

 <Tooltip >
  <TooltipTrigger asChild>
      <Button asChild variant="outline" className="rounded-full">
          <a
            href="https://github.com/saurabh-xd/memehunt"
            target="_blank"
            rel="noreferrer"
            aria-label="Open MemeHunt on GitHub"
          >
            <GithubIcon className="size-4" />
            Github
            <span className="text-foreground/70">{stars === null ? "0" : ` ${stars} `}</span>
            
          </a>
        </Button>
  </TooltipTrigger>
  <TooltipContent side="bottom">
    Github
  </TooltipContent>
</Tooltip>

      

       

        {isPending ? (
          <div className="flex h-10 min-w-28 items-center justify-center rounded-full border border-border/70 px-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : session?.user ? (
         
            
            <Button
              
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
