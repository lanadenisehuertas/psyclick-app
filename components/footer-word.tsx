'use client'

import { useEffect, useRef } from 'react'

/*
 * "PsyClick" rendered through an ordered (Bayer 4×4) dither of drifting
 * metaball blobs in the logo palette (deep ink → cyan → mint). A blob follows
 * the pointer and swells on hover. Runs only while on screen; static for
 * reduced motion. Only the pixels inside the letters are computed each frame,
 * and each is written as one 32-bit value.
 */

const PIXEL = 3 // css px per dither cell
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => v / 16 - 0.5)
const PALETTE = [
  [14, 52, 64], // deep ink (text floor, stays legible)
  [10, 107, 128], // #0a6b80
  [43, 184, 207], // #2bb8cf
  [112, 232, 192], // #70e8c0
  [222, 248, 250],
]
// RGBA bytes as one little-endian 32-bit word, so a pixel is a single write
const PACKED = PALETTE.map(([r, g, b]) => ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0)

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
    let img: ImageData | null = null
    let px32 = new Uint32Array(0)
    // Letter pixels only: index, x, y and its dither offset
    let cellIdx = new Int32Array(0)
    let cellX = new Float64Array(0)
    let cellY = new Float64Array(0)
    let cellDither = new Float64Array(0)
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
      // sit the glyph tops flush with the top of the box so spacing above is exact
      const ascent = o.measureText('PsyClick').actualBoundingBoxAscent
      o.fillText('PsyClick', w / 2, Math.min(h * 0.97, ascent + 1))
      const mask = o.getImageData(0, 0, w, h).data
      img = ctx.createImageData(w, h)
      px32 = new Uint32Array(img.data.buffer)
      let n = 0
      for (let i = 3; i < mask.length; i += 4) if (mask[i] >= 110) n++
      cellIdx = new Int32Array(n)
      cellX = new Float64Array(n)
      cellY = new Float64Array(n)
      cellDither = new Float64Array(n)
      let k = 0
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const p = y * w + x
          if (mask[p * 4 + 3] < 110) continue
          cellIdx[k] = p
          cellX[k] = x
          cellY[k] = y
          cellDither[k] = BAYER[(y & 3) * 4 + (x & 3)] * 1.1
          k++
        }
      }
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
      const b0x = blobs[0].x, b0y = blobs[0].y, b0r = blobs[0].r * blobs[0].r
      const b1x = blobs[1].x, b1y = blobs[1].y, b1r = blobs[1].r * blobs[1].r
      const b2x = blobs[2].x, b2y = blobs[2].y, b2r = blobs[2].r * blobs[2].r
      const hasPointer = pointer.r > 0.5
      const px = pointer.x, py = pointer.y, pr = pointer.r * pointer.r * 1.6
      for (let k = 0; k < cellIdx.length; k++) {
        const x = cellX[k]
        const y = cellY[k]
        let dx = x - b0x
        let dy = y - b0y
        let v = 0
        v += b0r / (dx * dx + dy * dy + 1)
        dx = x - b1x
        dy = y - b1y
        v += b1r / (dx * dx + dy * dy + 1)
        dx = x - b2x
        dy = y - b2y
        v += b2r / (dx * dx + dy * dy + 1)
        if (hasPointer) {
          dx = x - px
          dy = y - py
          v += pr / (dx * dx + dy * dy + 1)
        }
        const level = Math.min(4, Math.max(0, Math.floor(0.6 + Math.min(v, 3.2) * 1.15 + cellDither[k])))
        px32[cellIdx[k]] = PACKED[level]
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
    // listen on the whole footer so the blob follows the pointer over the links too
    const zone = wrap.parentElement ?? wrap
    zone.addEventListener('pointermove', onMove)
    zone.addEventListener('pointerleave', onLeave)

    build()
    const ro = new ResizeObserver(() => build())
    ro.observe(wrap)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      zone.removeEventListener('pointermove', onMove)
      zone.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div ref={wrapRef} className="footer-word" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
