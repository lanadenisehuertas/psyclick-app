import type React from "react"
import type { Metadata, Viewport } from "next"
import { DM_Sans, Funnel_Display, IBM_Plex_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const display = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800"],
})

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
})

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-data",
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  title: "PsyClick | Clinical Psychomotor Screening",
  description: "PsyClick is a clinical decision-support app for Windows that pairs PHQ-9 and GAD-7 with keystroke and cursor biomarkers to surface psychomotor signs a session can miss. Built by ByteMe at FEU Institute of Technology.",
  keywords: ["clinical screening", "psychomotor", "PHQ-9", "GAD-7", "decision support", "healthcare"],
  generator: 'v0.app',
  icons: {
    icon: '/psyclick-icon.png',
    apple: '/psyclick-icon.png',
    shortcut: '/psyclick-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: "#0ABFBC",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
