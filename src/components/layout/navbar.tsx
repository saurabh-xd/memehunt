import React from 'react'
import { Button } from '../ui/button'
import { ModeToggle } from '../common/theme_toggle'

export default function Navbar() {
  return (
    <div className='flex justify-between py-4 px-3 '>
        <h2 className='text-lg font-bold'>MemeHunt</h2>

        <div className='flex gap-4'>
         <ModeToggle/>
            <Button>Sign In</Button>
        </div>
    </div>
  )
}
