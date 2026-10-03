'use client'

import { motion } from 'framer-motion'
import type React from 'react'

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

