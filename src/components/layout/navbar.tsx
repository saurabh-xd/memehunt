"use client"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { ModeToggle } from "../common/theme_toggle"
import { signOut, useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import {  CircleUser, Loader2 } from "lucide-react"
import { GithubIcon } from "../githubIcon"
import Link from "next/link"

export default function Navbar() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadStars() {
      try {
        const response = await fetch("https://api.github.com/repos/saurabh-xd/memehunt")
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
    <div className="flex w-full items-center justify-between gap-3 p-3 py-2 sm:p-4">
      <Link
       href="/"
        className="font-heading min-w-0 cursor-pointer text-sm font-bold tracking-tight sm:text-base md:text-lg"
      >
        <span className="block truncate">MemeHunt AI</span>
      </Link>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">

 <ModeToggle />

 
 
      <Button asChild variant="outline" className="px-3 sm:px-4">
          <a
            href="https://github.com/saurabh-xd/memehunt"
            target="_blank"
            rel="noreferrer"
            aria-label="Open MemeHunt on GitHub"
          >
            <GithubIcon className="size-4" />
            <span className="hidden sm:inline">Github</span>
            <span className="text-foreground/70">{stars === null ? "0" : ` ${stars} `}</span>
            
          </a>
        </Button>


      

       

        {isPending ? (
          <div className="flex h-10 min-w-10 items-center justify-center rounded-full border border-border/70 px-3 text-sm text-muted-foreground sm:min-w-28 sm:px-4">
            <Loader2 className="size-4 animate-spin" />
          </div>
        ) : session?.user ? (
         
            
            <Button
              
              className="rounded-full cursor-pointer bg-gradient-to-b from-blue-300 to-blue-500 px-3 text-white font-medium hover:opacity-80 transition-all duration-300 sm:px-4"
              onClick={handleSignOut}
            > <CircleUser className="size-4" />
              <span className="hidden sm:inline">Sign Out</span>
            
            </Button>
         
        ) : (
          <Button className="rounded-full cursor-pointer bg-gradient-to-b from-blue-300 to-blue-500 text-white font-medium hover:opacity-80 transition-all duration-300 " onClick={() => router.push("/sign-in")}>
                 <CircleUser className="size-4" />
            <span className="hidden sm:inline">Sign In</span>
       
          </Button>
        )}
      </div>
    </div>
  )
}
