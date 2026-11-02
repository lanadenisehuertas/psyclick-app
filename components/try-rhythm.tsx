'use client'

import { RotateCcw } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Eyebrow, Reveal } from '@/components/landing-kit'

/*
 * "Try it" playground: the visitor types and sees the same timing signal
 * PsyClick reads. Only intervals are kept in memory, in this tab. The text
 * itself is never stored, sent, or looked at.
 *   flight = time between two characters landing
 *   dwell  = how long a key is held down (physical keyboards only;
 *            phone keyboards don't report key up/down reliably)
 */

const PROMPTS = [
  'How has your week been, honestly?',
  'Describe a small thing that annoyed you today.',
  'What are you looking forward to?',
]
const MAX_BARS = 44
const PAUSE_MS = 600
const BAR_CAP_MS = 1200

type Bar = { id: number; ms: number }

const avg = (a: number[]) => (a.length ? Math.round(a.reduce((s, v) => s + v, 0) / a.length) : null)

export default function TryRhythm() {
  const [prompt, setPrompt] = useState(0)
  const [bars, setBars] = useState<Bar[]>([])
  const [keys, setKeys] = useState(0)
  const [flights, setFlights] = useState<number[]>([])
  const [dwells, setDwells] = useState<number[]>([])
  const [longest, setLongest] = useState(0)
  const last = useRef<number | null>(null)
  const down = useRef(new Map<string, number>())
  const seq = useRef(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const onInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const ev = e.nativeEvent as InputEvent
    if (ev.inputType && !ev.inputType.startsWith('insert')) return
    const now = performance.now()
    setKeys((k) => k + 1)
    if (last.current != null) {
      const ms = Math.round(now - last.current)
      // a gap over 5 s means the visitor walked away, not a hesitation
      if (ms < 5000) {
        seq.current += 1
        const id = seq.current
        setBars((b) => [...b.slice(-(MAX_BARS - 1)), { id, ms }])
        setFlights((f) => [...f.slice(-59), ms])
        setLongest((l) => Math.max(l, ms))
      }
    }
    last.current = now
  }, [])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!e.code || e.key === 'Unidentified' || e.repeat) return
    down.current.set(e.code, performance.now())
  }, [])
  const onKeyUp = useCallback((e: React.KeyboardEvent) => {
    const t = down.current.get(e.code)
    if (t == null) return
    down.current.delete(e.code)
    const ms = Math.round(performance.now() - t)
    if (ms > 0 && ms < 1500) setDwells((d) => [...d.slice(-59), ms])
  }, [])

  const reset = () => {
    setBars([])
    setKeys(0)
    setFlights([])
    setDwells([])
    setLongest(0)
    last.current = null
    down.current.clear()
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus({ preventScroll: true })
    }
  }

  const flight = avg(flights)
  const dwell = avg(dwells)
  const pauses = flights.filter((f) => f > PAUSE_MS).length

  return (
    <section id="try" className="section try">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>Try it</Eyebrow>
          <h2>
            Type a line. See your <em className="accent">rhythm.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">
            This is the signal PsyClick reads. It’s measured here in your browser only, and nothing you type is sent
            or saved.
          </p>
        </Reveal>
      </div>

      <Reveal className="try-card">
        <div className="try-main">
          <div className="try-prompts" role="tablist" aria-label="Pick a prompt">
            {PROMPTS.map((p, i) => (
              <button
                key={p}
                role="tab"
                aria-selected={prompt === i}
                className={prompt === i ? 'on' : ''}
                onClick={() => setPrompt(i)}
              >
                {i + 1}
              </button>
            ))}
            <span className="mono">Prompt {prompt + 1} of 3</span>
          </div>
          <label htmlFor="try-in" className="try-q">
            {PROMPTS[prompt]}
          </label>
          <textarea
            id="try-in"
            ref={inputRef}
            rows={2}
            maxLength={160}
            placeholder="Start typing…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            onInput={onInput}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
          />
          <div className="try-strip" aria-hidden="true">
            {bars.length === 0 && <span className="try-empty mono">your keystrokes land here</span>}
            {bars.map((b) => (
              <i
                key={b.id}
                className={b.ms > PAUSE_MS ? 'amber' : ''}
                style={{ transform: `scaleY(${Math.max(0.1, Math.min(1, Math.sqrt(b.ms / BAR_CAP_MS)))})` }}
              />
            ))}
          </div>
          <div className="try-legend mono">
            <span>
              <i /> time between keys
            </span>
            <span>
              <i className="amber" /> pause over 0.6 s
            </span>
          </div>
        </div>

        <div className="try-side">
          <dl className="try-stats" aria-live="polite">
            <div>
              <dt className="mono">Keys</dt>
              <dd>{keys}</dd>
            </div>
            <div>
              <dt className="mono">Avg flight</dt>
              <dd>
                {flight ?? '–'}
                {flight != null && <small> ms</small>}
              </dd>
            </div>
            <div>
              <dt className="mono">Avg dwell</dt>
              <dd>
                {dwell ?? '–'}
                {dwell != null && <small> ms</small>}
              </dd>
            </div>
            <div>
              <dt className="mono">Pauses</dt>
              <dd>
                {pauses}
                {longest > PAUSE_MS && <small> · max {(longest / 1000).toFixed(1)} s</small>}
              </dd>
            </div>
          </dl>
          <p className="try-note">
            In a real session these are compared with the client’s own warm-up baseline, never with anyone else’s
            typing.
          </p>
          <button className="try-reset" onClick={reset} disabled={keys === 0}>
            <RotateCcw size={14} /> Clear and try again
          </button>
        </div>
      </Reveal>
    </section>
  )
}
