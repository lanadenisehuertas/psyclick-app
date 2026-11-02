import type React from "react"
import type { Metadata, Viewport } from "next"
import { DM_Sans, IBM_Plex_Mono, Instrument_Serif, Schibsted_Grotesk } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const display = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
})

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
})

// Serif italic for the occasional accent word in a headline
const serif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  style: "italic",
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
  themeColor: "#0f2a33",
}

const LOADER_CSS = `
.pc-loader{position:fixed;inset:0;z-index:200;display:grid;place-content:center;justify-items:center;gap:18px;
  background:radial-gradient(60% 50% at 50% 45%,#12404a 0%,#0b2329 70%);color:#bfe9ef;
  transition:opacity .45s ease,visibility .45s;animation:pc-loader-out .4s ease 10s forwards}
html.pc-ready .pc-loader{opacity:0;visibility:hidden;pointer-events:none}
.pc-loader-mark{position:relative;width:64px;height:64px;display:grid;place-items:center}
.pc-loader-mark svg{position:absolute;inset:0;width:100%;height:100%;fill:none;stroke-width:2.5}
.pc-loader-mark circle{stroke:rgba(104,216,232,.15)}
.pc-loader-mark .arc{stroke:#68d8e8;stroke-linecap:round;stroke-dasharray:46 200;transform-origin:center;
  animation:pc-loader-spin 1s linear infinite;filter:drop-shadow(0 0 6px rgba(104,216,232,.7))}
.pc-loader-mark img{border-radius:9px}
.pc-loader-keys{display:flex;align-items:flex-end;gap:5px;height:22px}
.pc-loader-keys i{width:4px;height:100%;border-radius:2px;background:#2bb8cf;transform-origin:bottom;
  animation:pc-loader-key 1.1s ease-in-out infinite}
.pc-loader-keys i:nth-child(2){animation-delay:.1s}.pc-loader-keys i:nth-child(3){animation-delay:.2s}
.pc-loader-keys i:nth-child(4){animation-delay:.55s}.pc-loader-keys i:nth-child(5){animation-delay:.65s}
.pc-loader-keys i:nth-child(6){animation-delay:.75s}.pc-loader-keys i:nth-child(7){animation-delay:.85s}
.pc-loader-keys i.late{background:#f0a63a}
.pc-loader-text{font:500 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;color:rgba(191,233,239,.7)}
@keyframes pc-loader-spin{to{transform:rotate(360deg)}}
@keyframes pc-loader-key{0%,100%{transform:scaleY(.25)}40%{transform:scaleY(1)}}
@keyframes pc-loader-out{to{opacity:0;visibility:hidden}}
@media (prefers-reduced-motion:reduce){.pc-loader-mark .arc,.pc-loader-keys i{animation:none}}
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable} ${serif.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {/* Page loader: plain HTML + CSS so it paints before any JS runs.
            Landing adds .pc-ready to <html> once hydrated, which fades it out. */}
        <style dangerouslySetInnerHTML={{ __html: LOADER_CSS }} />
        <div className="pc-loader" role="status" aria-live="polite">
          <div className="pc-loader-mark">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r="29" />
              <circle className="arc" cx="32" cy="32" r="29" />
            </svg>
            <img src="/psyclick-icon.webp" alt="" width={34} height={34} />
          </div>
          <div className="pc-loader-keys" aria-hidden="true">
            <i /><i /><i /><i className="late" /><i /><i /><i />
          </div>
          <span className="pc-loader-text">Loading PsyClick</span>
        </div>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
