'use client'

import { motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'

export const EASE = [0.22, 1, 0.36, 1] as const

/* ─── Motion primitives ─────────────────────────────────── */

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      data-reveal=""
      initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`eyebrow-row${dark ? ' dark' : ''}`}>
      <span className="eyebrow">
        <i />
        {children}
      </span>
      <span className="eyebrow-rule" />
    </div>
  )
}


/**
 * Dots + arrows for a horizontal scroll-snap row. The row only becomes a
 * swipeable carousel on phones (CSS), so this control is hidden elsewhere.
 */
export function SnapNav({
  target,
  count,
  label,
}: {
  target: React.RefObject<HTMLElement | null>
  count: number
  label: string
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const el = target.current
    if (!el) return
    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const left = el.getBoundingClientRect().left
        let best = 0
        let bestDist = Infinity
        Array.from(el.children).forEach((c, i) => {
          const d = Math.abs(c.getBoundingClientRect().left - left - parseFloat(getComputedStyle(el).paddingLeft))
          if (d < bestDist) {
            bestDist = d
            best = i
          }
        })
        setIndex(best)
      })
    }
    el.addEventListener('scroll', update, { passive: true })
    return () => {
      el.removeEventListener('scroll', update)
      cancelAnimationFrame(raf)
    }
  }, [target])

  const go = (i: number) => {
    const el = target.current
    const kid = el?.children[Math.max(0, Math.min(count - 1, i))] as HTMLElement | undefined
    if (!el || !kid) return
    const pad = parseFloat(getComputedStyle(el).paddingLeft)
    el.scrollTo({ left: kid.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft - pad, behavior: 'smooth' })
  }

  return (
    <div className="snap-nav" role="group" aria-label={label}>
      <button aria-label="Previous" onClick={() => go(index - 1)} disabled={index === 0}>
        <ChevronLeft size={16} />
      </button>
      <div className="snap-dots">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            aria-label={`Go to ${i + 1} of ${count}`}
            aria-current={i === index}
            className={i === index ? 'on' : ''}
            onClick={() => go(i)}
          />
        ))}
      </div>
      <span className="snap-count mono">
        {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
      </span>
      <button aria-label="Next" onClick={() => go(index + 1)} disabled={index === count - 1}>
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

/**
 * Scroll-driven steps for a "hold" section: put `ref` on a wrapper that holds a
 * sticky block plus a spacer. While the block is held, scrolling walks through
 * `count` steps; goTo(i) scrolls to step i so scroll and view stay in sync.
 * With `media` set, scrolling only drives steps while that query matches.
 */
export function useScrollSteps(count: number, top = 88, media?: string) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const enabled = useRef(!media)
  const lenis = useLenis()

  useEffect(() => {
    if (!media) return
    const mq = window.matchMedia(media)
    const update = () => (enabled.current = mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [media])

  const { scrollYProgress } = useScroll({ target: ref, offset: [`start ${top}px`, 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!enabled.current) return
    const i = Math.min(count - 1, Math.max(0, Math.floor(v * count)))
    setActive((prev) => (prev === i ? prev : i))
  })

  const goTo = (i: number) => {
    setActive(i)
    const el = ref.current
    if (!el || !enabled.current) return
    const r = el.getBoundingClientRect()
    const y0 = r.top + window.scrollY - top
    const y1 = r.bottom + window.scrollY - window.innerHeight
    const y = y0 + ((i + 0.5) / count) * (y1 - y0)
    if (lenis) lenis.scrollTo(y, { duration: 0.8 })
    else window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return { ref, active, goTo }
}
