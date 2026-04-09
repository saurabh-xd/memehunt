import type { Metadata } from "next";
import { Geist_Mono, Manrope, Sora, Space_Grotesk } from "next/font/google";
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
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-brand",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://memehunt.tech";
const siteDescription =
  "Find the right meme with AI, customize text and images in the meme editor, and download it instantly.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MemeHunt - AI Meme Finder & Meme Editor",
    template: "%s | MemeHunt",
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MemeHunt - AI Meme Finder & Meme Editor",
    description: siteDescription,
    url: siteUrl,
    siteName: "MemeHunt",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1895,
        height: 905,
        alt: "MemeHunt - AI Meme Finder & Editor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MemeHunt - AI Meme Finder & Meme Editor",
    description: siteDescription,
    images: ["/og.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", manrope.variable, sora.variable, spaceGrotesk.variable)}
      suppressHydrationWarning
    >
      <body
        className={`${geistMono.variable} antialiased `}
      >
        <Providers>
          <Navbar/>
          {children}
          <Footer/>
          <Toaster richColors />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
