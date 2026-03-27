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
}

export default function SignInDialog({showSignInDialog, setShowSignInDialog, limit}: props) {

     const router = useRouter();

  return (
     <Dialog open={showSignInDialog} onOpenChange={setShowSignInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in to keep generating</DialogTitle>
            <DialogDescription>
              You have used all {limit} free AI generations. Sign in with Google
              to continue creating memes.
            </DialogDescription>
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
