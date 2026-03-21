"use client"
import { Button } from '../ui/button'
import { ModeToggle } from '../common/theme_toggle'
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function Navbar() {

    const { data: session, isPending } = useSession();
    const router = useRouter();

  return (
    <div className='flex justify-between py-4 px-3 '>
        <h2 className='text-lg font-bold'>MemeHunt</h2>

        <div className='flex gap-4'>
         <ModeToggle/>

         {
          !session?.user && (
                
             <Button  onClick={()=>router.push("/sign-in")}>Sign In</Button>
          )
         }
           
        </div>
    </div>
  )
}
