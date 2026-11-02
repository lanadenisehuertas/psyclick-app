'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'

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
