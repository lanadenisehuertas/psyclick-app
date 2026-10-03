'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, Lightformer, MeshTransmissionMaterial, RoundedBox } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/*
 * PsyClick's instruments, in glass: the mouse pointer that leaves a cursor
 * trace (with the hesitation loop PsyClick measures), and keycaps that press
 * in a typing rhythm — one of them late, lit amber, the way a pause shows up
 * in flight time.
 */

const TEAL = new THREE.Color('#0abfbc')
const AMBER = new THREE.Color('#f5a623')

function Backdrop() {
  // Refraction needs something to bend: a soft clinical gradient, no HDR fetch.
  const texture = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 512
    const g = c.getContext('2d')!
    const base = g.createLinearGradient(0, 0, 0, 512)
    base.addColorStop(0, '#c6efea')
    base.addColorStop(0.55, '#eaf9f7')
    base.addColorStop(0.62, '#ffffff')
    base.addColorStop(1, '#b0e6df')
    g.fillStyle = base
    g.fillRect(0, 0, 512, 512)
    const blob = (x: number, y: number, r: number, col: string) => {
      const rg = g.createRadialGradient(x, y, 0, x, y, r)
      rg.addColorStop(0, col)
      rg.addColorStop(1, 'rgba(255,255,255,0)')
      g.fillStyle = rg
      g.fillRect(0, 0, 512, 512)
    }
    blob(150, 300, 180, 'rgba(54,201,142,0.35)')
    blob(390, 180, 160, 'rgba(91,164,207,0.38)')
    blob(256, 320, 120, 'rgba(255,255,255,0.9)')
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])

  return (
    <mesh position={[0, 0, -4]} scale={[22, 13, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

/** Classic arrow pointer, extruded and bevelled. Tip sits at the local origin. */
function Pointer() {
  const geometry = useMemo(() => {
    const pts: [number, number][] = [
      [0, 0],
      [0, -16],
      [3.6, -12.4],
      [6.6, -19.2],
      [9.3, -18.1],
      [6.3, -11.4],
      [11.4, -11.4],
    ]
    const shape = new THREE.Shape()
    shape.moveTo(pts[0][0], pts[0][1])
    pts.slice(1).forEach(([x, y]) => shape.lineTo(x, y))
    shape.closePath()
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: 2.2,
      bevelEnabled: true,
      bevelThickness: 1.1,
      bevelSize: 0.9,
      bevelSegments: 10,
      curveSegments: 8,
    })
    g.translate(0, 0, -1.1)
    g.scale(0.095, 0.095, 0.095)
    g.computeVertexNormals()
    return g
  }, [])

  return (
    <mesh geometry={geometry}>
      <MeshTransmissionMaterial
        backside
        backsideThickness={0.3}
        samples={6}
        resolution={512}
        thickness={0.6}
        roughness={0.03}
        ior={1.4}
        chromaticAberration={0.4}
        anisotropicBlur={0.15}
        distortion={0.15}
        distortionScale={0.3}
        temporalDistortion={0.05}
        color="#e3fbf7"
        attenuationColor="#5fd6cf"
        attenuationDistance={1.4}
      />
    </mesh>
  )
}

/** Glowing cursor trace that redraws itself, ending at the pointer tip. */
function Trace({ end }: { end: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null)
  const { geometry, count } = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-0.9, -0.85, -0.3),
        new THREE.Vector3(-0.6, -0.55, 0),
        new THREE.Vector3(-0.25, -0.5, 0.2),
        new THREE.Vector3(-0.05, -0.15, 0.1),
        new THREE.Vector3(-0.35, 0.2, 0.3), // hesitation loop
        new THREE.Vector3(-0.6, -0.05, 0.2),
        new THREE.Vector3(-0.3, -0.2, 0),
        new THREE.Vector3(0.0, 0.35, 0),
        new THREE.Vector3(0.05, 0.75, 0),
        end,
      ],
      false,
      'catmullrom',
      0.5,
    )
    const g = new THREE.TubeGeometry(curve, 400, 0.035, 12, false)
    return { geometry: g, count: g.index ? g.index.count : 0 }
  }, [end])

  useFrame((state) => {
    // draw on over 2.4 s, hold, fade, repeat
    const t = (state.clock.elapsedTime % 4.2) / 2.4
    const k = Math.min(1, t)
    const eased = 1 - Math.pow(1 - k, 3)
    geometry.setDrawRange(0, Math.floor((count * eased) / 3) * 3)
    const m = ref.current?.material as THREE.MeshBasicMaterial | undefined
    if (m) m.opacity = t > 1.55 ? Math.max(0, 1 - (t - 1.55) * 3) : 1
  })

  return (
    <mesh ref={ref} geometry={geometry}>
      <meshBasicMaterial color="#0abfbc" toneMapped={false} transparent />
    </mesh>
  )
}

const KEYS: { pos: [number, number, number]; rot: [number, number, number]; at: number; late?: boolean }[] = [
  { pos: [1.05, -0.75, 0.2], rot: [0.55, -0.4, 0.12], at: 0.0 },
  { pos: [1.8, -0.5, -0.3], rot: [0.5, -0.55, -0.08], at: 0.22 },
  { pos: [1.5, 0.35, 0.1], rot: [0.45, -0.5, 0.15], at: 1.45, late: true },
  { pos: [-0.6, 1.35, -0.7], rot: [0.5, 0.3, -0.1], at: 0.41 },
]
const RHYTHM = 2.6 // seconds per typing burst
const DWELL = 0.14

function Keycap({ pos, rot, at, late }: (typeof KEYS)[number]) {
  const cap = useRef<THREE.Group>(null)
  const led = useRef<THREE.MeshBasicMaterial>(null)

  useFrame((state) => {
    const t = (state.clock.elapsedTime + 0.6) % RHYTHM
    const d = t - at
    const down = d > 0 && d < DWELL ? Math.sin((d / DWELL) * Math.PI) : 0
    if (cap.current) cap.current.position.z = -0.16 * down
    if (led.current) {
      const glow = d > 0 && d < 0.6 ? 1 - d / 0.6 : 0
      led.current.color.copy(late ? AMBER : TEAL)
      led.current.opacity = 0.15 + 0.85 * glow
    }
  })

  return (
    <group position={pos} rotation={rot}>
      <mesh position={[0, 0, -0.23]}>
        <boxGeometry args={[0.58, 0.58, 0.04]} />
        <meshBasicMaterial ref={led} color="#0abfbc" transparent opacity={0.15} toneMapped={false} />
      </mesh>
      <group ref={cap}>
        <RoundedBox args={[0.62, 0.62, 0.34]} radius={0.1} smoothness={5}>
          <meshPhysicalMaterial
            transmission={1}
            thickness={0.6}
            roughness={0.08}
            ior={1.42}
            color={late ? '#fff2dc' : '#e6fbf8'}
            attenuationColor={late ? '#f5a623' : '#0abfbc'}
            attenuationDistance={1.2}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </RoundedBox>
        {/* dished top */}
        <mesh position={[0, 0, 0.175]}>
          <circleGeometry args={[0.19, 40]} />
          <meshBasicMaterial color={late ? '#ffd892' : '#9ff0e6'} transparent opacity={0.35} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function Rig() {
  const group = useRef<THREE.Group>(null)
  const { pointer } = useThree()
  const tip = useMemo(() => new THREE.Vector3(0.1, 1.05, 0), [])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, Math.sin(t * 0.25) * 0.18 + pointer.x * 0.3, 2.5, delta)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, Math.cos(t * 0.2) * 0.06 - pointer.y * 0.18, 2.5, delta)
  })

  return (
    <group ref={group}>
      <Trace end={tip} />
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
        <group position={tip} rotation={[0.25, -0.45, 0.32]}>
          <Pointer />
        </group>
      </Float>
      {KEYS.map((k, i) => (
        <Float key={i} speed={1 + i * 0.15} rotationIntensity={0.2} floatIntensity={0.6}>
          <Keycap {...k} />
        </Float>
      ))}
    </group>
  )
}

export default function HeroGlass({ still = false }: { still?: boolean }) {
  return (
    <Canvas
      frameloop={still ? 'demand' : 'always'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.4], fov: 38 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <Backdrop />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <group position={[1.3, 0.15, 0]} scale={0.92}>
        <Rig />
      </group>
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 4, -2]} scale={[12, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#5fd6cf" position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="circle" intensity={4} position={[0, 0, 6]} scale={3} />
      </Environment>
    </Canvas>
  )
}
