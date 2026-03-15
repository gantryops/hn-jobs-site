import type { Metadata } from "next"
import Script from "next/script"
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google"
import { Providers } from "./providers"
import { Nav } from "@/components/nav"
import { Footer } from "@/components/footer"
import "./globals.css"

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "HN Jobs Trends",
    template: "%s | HN Jobs Trends",
  },
  description: "Tech job market trends from Hacker News — updated monthly",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
      "text/plain": "/llms.txt",
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexSans.variable} ${jetbrainsMono.variable} antialiased`}>
        <Providers>
          <Nav />
          {children}
          <Footer />
        </Providers>
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            defer
            src={process.env.NEXT_PUBLIC_UMAMI_URL || "https://cloud.umami.is/script.js"}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </body>
    </html>
  )
}
