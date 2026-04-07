import Link from 'next/link';
import { GithubIcon } from '../githubIcon';
import { Linkedin, Twitter } from 'lucide-react';

export default function Footer() {

   const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t-2 bg-background mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col items-center gap-5 sm:gap-4 md:flex-row md:justify-between">
            
         
        

        
          <p className="text-sm text-muted-foreground font-bold order-1 md:order-2">
            © {currentYear} MemeHunt 
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-5  order-3">
            <Link 
              href="https://github.com/saurabh-xd" 
              target="_blank" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="w-5 h-5" />
            </Link>
            <Link
              href="https://x.com/_saurabh__xd" 
              target="_blank" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/saurabh-garkoti-784191322/" 
              target="_blank" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </div>
    </footer>
  )
}
