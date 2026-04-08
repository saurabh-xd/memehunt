"use client"
import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { ModeToggle } from "../common/theme_toggle"
import { signOut, useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import {  CircleUser, Loader2 } from "lucide-react"
import { GithubIcon } from "../githubIcon"
import Link from "next/link"
import { toast } from "sonner"
import Image from "next/image"

export default function Navbar() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [stars, setStars] = useState<number | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)

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
    try {
      setIsSigningOut(true)
      await signOut()
      toast.success("Signed out")
      router.refresh()
    } catch {
      toast.error("Could not sign out. Try again.")
    } finally {
      setIsSigningOut(false)
    }
  }

  const isSignedIn = Boolean(session?.user)
  const isAuthLoading = isPending || isSigningOut
  const authLabel = isSignedIn ? "Sign Out" : "Sign In"
  const authAriaLabel = isAuthLoading ? "Checking sign in status" : authLabel

  function handleAuthAction() {
    if (isAuthLoading) return

    if (isSignedIn) {
      handleSignOut()
      return
    }

    router.push("/sign-in")
  }

  return (
    <div className="flex w-full items-center justify-between gap-3 p-3 py-2 sm:p-4">
      <Link
       href="/"
        className="font-brand min-w-0 flex items-center justify-center cursor-pointer text-sm font-extrabold tracking-[-0.04em] sm:text-base md:text-lg"
      >
      <Image
        src="/logo.png"
        alt="MemeHunt logo"
        width={32}
        height={32}
        className="md:size-10 size-8 shrink-0 "
      />
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


      

       

        <Button
          className="min-w-10 rounded-full cursor-pointer px-3 text-white font-medium transition-all duration-300 hover:opacity-80 sm:min-w-28 sm:px-4"
          onClick={handleAuthAction}
          disabled={isAuthLoading}
          aria-label={authAriaLabel}
        >
          {isAuthLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CircleUser className="size-4" />
          )}
          <span className="hidden sm:inline">{isAuthLoading ? "Loading" : authLabel}</span>
        </Button>
      </div>
    </div>
  )
}
