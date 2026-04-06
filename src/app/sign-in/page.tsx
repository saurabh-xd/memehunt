"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/common/google";



export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      router.replace("/");
    }
  }, [router, session]);

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      await signIn.social({
        provider: "google",
      });
    } catch {
      toast.error("Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <section className="w-full max-w-sm rounded-[1.5rem] border border-border/70 bg-card/80 p-5 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:max-w-md sm:rounded-[2rem] sm:p-8">
        <div className="space-y-2.5 text-center sm:space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:text-xs sm:tracking-[0.24em]">
            Authentication
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Sign in to MemeHunt
          </h1>
          
        </div>

        <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
          <Button
            variant="outline"
            className="h-11 w-full rounded-full cursor-pointer justify-center gap-3 text-sm sm:h-12"
            disabled={loading || isPending}
            onClick={handleGoogleSignIn}
          >
            {loading || isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          <p className="text-center text-[11px] leading-5 text-muted-foreground sm:text-xs">
            By continuing, you&apos;ll authenticate with your Google account.
          </p>
        </div>
      </section>
    </main>
  );
}
