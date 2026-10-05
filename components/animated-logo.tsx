'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

/*
 * The PsyClick mark, animated as in the app's sign-in screen
 * (psyclick-secure/frontend/src/components/AnimatedLogo.jsx): signals travel
 * from the hub out along the logo's own network lines, with orbit rings and
 * a soft glow in the logo colours. Node centres are measured from the
 * 578 × 579 logo image.
 */

const HUB = { x: 272, y: 220, r: 43 }
const NODES = [
  { x: 356, y: 145, r: 27 },
  { x: 390, y: 214, r: 28 },
  { x: 367, y: 315, r: 20 },
  { x: 297, y: 345, r: 33 },
  { x: 100, y: 245, r: 15 },
  { x: 204, y: 137, r: 29 },
  { x: 272, y: 135, r: 16 },
]
const CYCLE = 3.6

export default function AnimatedLogo({ size = 200 }: { size?: number }) {
  // Loops run only while the logo is on screen: the signal dots animate SVG
  // attributes, which would otherwise re-render the page every frame.
  const ref = useRef<HTMLDivElement>(null)
  const live = useInView(ref, { margin: '200px' })
  const still = useReducedMotion() || !live
  const loop = (extra: Record<string, unknown> = {}) =>
    still ? { duration: 0 } : { repeat: Infinity, ease: 'easeInOut' as const, ...extra }

  return (
    <motion.div
      ref={ref}
      className="alogo"
      style={{ width: size, height: size }}
      aria-hidden="true"
      animate={still ? undefined : { y: [0, -6, 0] }}
      transition={loop({ duration: 6 })}
    >
      <motion.div
        className="alogo-glow"
        animate={still ? undefined : { scale: [1, 1.08, 1], opacity: [0.75, 1, 0.75] }}
        transition={loop({ duration: 5 })}
      />
      <svg className="alogo-rings" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="alogo-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#70E8C0" />
            <stop offset=".5" stopColor="#68D8E8" />
            <stop offset="1" stopColor="#78A8D8" />
          </linearGradient>
        </defs>
        <motion.g
          style={{ originX: '100px', originY: '100px' }}
          animate={still ? undefined : { rotate: 360 }}
          transition={loop({ duration: 26, ease: 'linear' })}
        >
          <circle cx="100" cy="100" r="96" fill="none" stroke="url(#alogo-ring)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="150 60 40 60 90 200" />
          <circle cx="100" cy="4" r="3" fill="#70E8C0" />
          <circle cx="196" cy="100" r="2.2" fill="#78A8D8" />
        </motion.g>
        <motion.g
          style={{ originX: '100px', originY: '100px' }}
          animate={still ? undefined : { rotate: -360 }}
          transition={loop({ duration: 40, ease: 'linear' })}
        >
          <circle cx="100" cy="100" r="88" fill="none" stroke="#68D8E8" strokeOpacity=".45" strokeWidth="1" strokeDasharray="1 5" strokeLinecap="round" />
          <circle cx="12" cy="100" r="2.4" fill="#68D8E8" />
        </motion.g>
      </svg>
      <motion.div
        className="alogo-plate"
        initial={{ scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 140, damping: 16 }}
      />
      <motion.div
        className="alogo-mark"
        initial={{ scale: 0.7, opacity: 0, rotate: -30 }}
        whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 110, damping: 14, delay: 0.1 }}
      >
        <img src="/psyclick-icon.webp" alt="" />
        <svg viewBox="0 0 578 579">
          {!still &&
            NODES.map((n, i) => {
              const delay = 0.9 + i * (CYCLE / NODES.length)
              return (
                <g key={i}>
                  <motion.circle
                    r="9"
                    fill="#3D5FA8"
                    initial={{ cx: HUB.x, cy: HUB.y, opacity: 0 }}
                    animate={{ cx: [HUB.x, n.x], cy: [HUB.y, n.y], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.1, delay, repeat: Infinity, repeatDelay: CYCLE - 1.1, ease: 'easeIn' }}
                  />
                  <motion.circle
                    cx={n.x}
                    cy={n.y}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="5"
                    initial={{ r: n.r, opacity: 0 }}
                    animate={{ r: [n.r, n.r + 26], opacity: [0.9, 0] }}
                    transition={{ duration: 0.9, delay: delay + 1.05, repeat: Infinity, repeatDelay: CYCLE - 0.9, ease: 'easeOut' }}
                  />
                </g>
              )
            })}
          {!still && (
            <motion.circle
              cx={HUB.x}
              cy={HUB.y}
              fill="none"
              stroke="#fff"
              strokeWidth="6"
              initial={{ r: HUB.r, opacity: 0 }}
              animate={{ r: [HUB.r, HUB.r + 34], opacity: [0.9, 0] }}
              transition={{ duration: 1.4, delay: 0.6, repeat: Infinity, repeatDelay: CYCLE - 1.4, ease: 'easeOut' }}
            />
          )}
        </svg>
      </motion.div>
    </motion.div>
  )
}
