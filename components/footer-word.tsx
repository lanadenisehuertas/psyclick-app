'use client'

import { useEffect, useRef } from 'react'

/*
 * "PsyClick" rendered through an ordered (Bayer 4×4) dither of drifting
 * metaball blobs in the app's teal/green palette. A blob follows the pointer
 * and swells on hover. Runs only while on screen; static for reduced motion.
 */

const PIXEL = 3 // css px per dither cell
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.5)
const PALETTE = [
  [14, 52, 52], // deep teal (text floor, stays legible)
  [8, 128, 125],
  [10, 191, 188], // #0ABFBC
  [54, 201, 142], // #36C98E
  [210, 255, 244],
]

export default function FooterWord() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0
    let h = 0
    let mask: Uint8ClampedArray = new Uint8ClampedArray()
    let img: ImageData | null = null
    const pointer = { x: -999, y: -999, r: 0, target: 0 }

    const build = async () => {
      await document.fonts.ready
      const rect = wrap.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect.width / PIXEL))
      h = Math.max(1, Math.floor(rect.height / PIXEL))
      canvas.width = w
      canvas.height = h
      const off = document.createElement('canvas')
      off.width = w
      off.height = h
      const o = off.getContext('2d')!
      const family = getComputedStyle(wrap).fontFamily
      let size = h * 1.22
      o.font = `700 ${size}px ${family}`
      const measured = o.measureText('PsyClick').width
      if (measured > w * 0.96) size *= (w * 0.96) / measured
      o.font = `700 ${size}px ${family}`
      o.textAlign = 'center'
      o.textBaseline = 'alphabetic'
      o.fillStyle = '#fff'
      o.fillText('PsyClick', w / 2, h * 0.97)
      mask = o.getImageData(0, 0, w, h).data
      img = ctx.createImageData(w, h)
      draw(performance.now())
    }

    const draw = (now: number) => {
      if (!img) return
      const t = now / 1000
      const blobs = [
        { x: w * (0.25 + 0.2 * Math.sin(t * 0.4)), y: h * (0.5 + 0.3 * Math.cos(t * 0.55)), r: h * 0.55 },
        { x: w * (0.6 + 0.25 * Math.cos(t * 0.33)), y: h * (0.45 + 0.35 * Math.sin(t * 0.47)), r: h * 0.5 },
        { x: w * (0.85 + 0.1 * Math.sin(t * 0.6)), y: h * (0.6 + 0.25 * Math.sin(t * 0.29)), r: h * 0.4 },
      ]
      pointer.r += (pointer.target - pointer.r) * 0.12
      const d = img.data
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4
          if (mask[i + 3] < 110) {
            d[i + 3] = 0
            continue
          }
          let v = 0
          for (const b of blobs) {
            const dx = x - b.x
            const dy = y - b.y
            v += (b.r * b.r) / (dx * dx + dy * dy + 1)
          }
          if (pointer.r > 0.5) {
            const dx = x - pointer.x
            const dy = y - pointer.y
            v += (pointer.r * pointer.r * 1.6) / (dx * dx + dy * dy + 1)
          }
          const level = Math.min(4, Math.max(0, Math.floor(0.6 + Math.min(v, 3.2) * 1.15 + BAYER[(y & 3) * 4 + (x & 3)] * 1.1)))
          const c = PALETTE[level]
          d[i] = c[0]
          d[i + 1] = c[1]
          d[i + 2] = c[2]
          d[i + 3] = 255
        }
      }
      ctx.putImageData(img, 0, 0)
    }

    let raf = 0
    let running = false
    const loop = (now: number) => {
      draw(now)
      if (running) raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => {
      if (reduce) return
      if (e.isIntersecting && !running) {
        running = true
        raf = requestAnimationFrame(loop)
      } else if (!e.isIntersecting) {
        running = false
        cancelAnimationFrame(raf)
      }
    })
    io.observe(wrap)

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect()
      pointer.x = (e.clientX - r.left) / PIXEL
      pointer.y = (e.clientY - r.top) / PIXEL
      pointer.target = h * 0.42
      if (reduce) draw(performance.now())
    }
    const onLeave = () => {
      pointer.target = 0
    }
    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerleave', onLeave)

    build()
    const ro = new ResizeObserver(() => build())
    ro.observe(wrap)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={wrapRef} className="footer-word" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
