import type React from "react"
import type { Metadata, Viewport } from "next"
import { DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800", "900"],
})

export const metadata: Metadata = {
  title: "PsyClick | Clinical Psychomotor Screening",
  description: "PsyClick is a welcoming desktop companion for psychomotor screening, emotional tasks, and clinician-ready reports. Decision-support tool by ByteMe.",
  keywords: ["clinical screening", "psychomotor", "PHQ-9", "GAD-7", "decision support", "healthcare"],
  generator: 'v0.app',
  icons: {
    icon: '/psyclick-icon.png',
    apple: '/psyclick-icon.png',
    shortcut: '/psyclick-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: "#00A99D",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={_dmSans.variable}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
