'use client'

import { FileText, ShieldAlert } from 'lucide-react'
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import type React from 'react'
import { useEffect, useRef } from 'react'

import AppDashboard from '@/components/app-dashboard'

/*
 * The real dashboard replica, staged in depth: report fragments float in front
 * of it at different distances, drift at different speeds while scrolling, and
 * the whole stage leans a few degrees toward the pointer. Transforms only, so it
 * stays cheap on clinic hardware; phones and reduced motion get the flat dashboard.
 */

// Inter-key gaps for the rhythm card, ms; index 9 is the hesitation
const GAPS = [120, 150, 110, 170, 130, 160, 120, 175, 140, 520, 180, 190, 170, 185]

function Float({
  className,
  depth,
  progress,
  children,
}: {
  className: string
  depth: number
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  children: React.ReactNode
}) {
  // Nearer cards (bigger depth) travel further: parallax reads as distance
  const y = useTransform(progress, [0, 1], [depth * 90, depth * -90])
  return (
    <motion.div className={`ds-float ${className}`} style={{ y, translateZ: depth * 60 }} aria-hidden="true">
      {children}
    </motion.div>
  )
}

export default function DashStage() {
  const stage = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'end start'] })

  // Pointer lean, springy and small
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rotY = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), { stiffness: 120, damping: 20 })
  const rotX = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 20 })

  useEffect(() => {
    const el = stage.current
    if (!el || reduce || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      px.set((e.clientX - r.left) / r.width - 0.5)
      py.set((e.clientY - r.top) / r.height - 0.5)
    }
    const onLeave = () => {
      px.set(0)
      py.set(0)
    }
    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [px, py, reduce])

  return (
    <div ref={stage} className="ds-stage">
      <div className="ds-floor" aria-hidden="true" />
      <motion.div className="ds-rig" style={reduce ? undefined : { rotateX: rotX, rotateY: rotY }}>
        <AppDashboard />

        <Float className="ds-flag" depth={1.4} progress={scrollYProgress}>
          <span className="ds-k mono">C-002 · today 10:05</span>
          <span className="pd-pill follow">Follow up</span>
          <p>Self-report says mild. Typing is 38% slower than this client’s own baseline.</p>
        </Float>

        <Float className="ds-rhythm" depth={1} progress={scrollYProgress}>
          <span className="ds-k mono">Prompt 4 · time between keys</span>
          <div className="ds-bars">
            {GAPS.map((g, i) => (
              <i key={i} className={i === 9 ? 'late' : undefined} style={{ height: `${Math.min(100, g / 5.4)}%` }} />
            ))}
          </div>
          <small>
            <b>1.1 s</b> pause before “fine”
          </small>
        </Float>

        <Float className="ds-safety" depth={1.8} progress={scrollYProgress}>
          <ShieldAlert size={16} />
          <span>
            <b>Self-harm answer</b>
            <small>Always shown first</small>
          </span>
        </Float>

        <Float className="ds-pdf" depth={0.7} progress={scrollYProgress}>
          <FileText size={15} />
          <span>Report saved as PDF</span>
        </Float>
      </motion.div>
    </div>
  )
}
