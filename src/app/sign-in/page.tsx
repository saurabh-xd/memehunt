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
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card/80 p-8 shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="space-y-3 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Authentication
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Sign in to MemeHunt
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Save your session and continue building memes with Google.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            variant="outline"
            className="h-12 w-full rounded-full cursor-pointer justify-center gap-3"
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

          <p className="text-center text-xs leading-5 text-muted-foreground">
            By continuing, you&apos;ll authenticate with your Google account.
          </p>
        </div>
      </section>
    </main>
  );
}
