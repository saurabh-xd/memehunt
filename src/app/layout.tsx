import type { Metadata } from "next";
import { Geist_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/navbar";
import Providers from "@/components/providers/providers";
import { Toaster } from "sonner";
import Footer from "@/components/layout/footer";
import { Analytics } from "@vercel/analytics/next";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MemeHunt",
  description: "Find the perfect meme template using AI in seconds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", manrope.variable, sora.variable)}
      suppressHydrationWarning
    >
      <body
        className={`${geistMono.variable} antialiased `}
      >
        <Providers>
          <Navbar/>
          {children}
          <Footer/>
          <Toaster richColors position="top-center" />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
