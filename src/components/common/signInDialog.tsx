import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

type props = {
showSignInDialog: boolean
setShowSignInDialog: (v: boolean) => void;
limit: number
title?: string
description?: string
}

export default function SignInDialog({
  showSignInDialog,
  setShowSignInDialog,
  limit,
  title = "Sign in to keep generating",
  description,
}: props) {

     const router = useRouter();
     const body =
       description ??
       `You have used all ${limit} free AI generations. Sign in with Google to continue creating memes.`;

  return (
     <Dialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{body}</DialogDescription>
          </DialogHeader>

          <Button
            type="button"
            className="flex-1 rounded-full cursor-pointer"
            onClick={() => router.push("/sign-in")}
          >
            Sign In
          </Button>
        </DialogContent>
      </Dialog>
  )
}
