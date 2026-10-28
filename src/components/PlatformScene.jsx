import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BLUE = new THREE.Color('#00A1D6')
const CYAN = new THREE.Color('#4cc9ee')
const HOT_WHITE = new THREE.Color('#dff7ff')

/** Radial glow texture for soft light pools and water reflections. */
function useGlowTexture(inner = 'rgba(0,161,214,1)', mid = 'rgba(0,120,170,0.45)', outer = 'rgba(10,40,60,0)') {
  return useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, inner)
    g.addColorStop(0.36, mid)
    g.addColorStop(1, outer)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [inner, mid, outer])
}

/** Procedural brushed metallic + vertical specular streak texture for the stage deck & wall. */
function useStageDeckTexture() {
  return useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')

    const bg = ctx.createRadialGradient(size / 2, size * 0.62, 10, size / 2, size / 2, size / 2)
    bg.addColorStop(0, '#1c4560')
    bg.addColorStop(0.45, '#132C3C')
    bg.addColorStop(0.85, '#0b1c28')
    bg.addColorStop(1, '#07121a')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, size, size)

    // Subtle concentric brushed rings on the metallic stage deck
    ctx.strokeStyle = 'rgba(110, 215, 245, 0.08)'
    for (let r = 24; r < size / 2; r += 6) {
      ctx.lineWidth = (r % 18 === 0) ? 1.2 : 0.5
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Bright reflection streaks from the 4 cards standing on the stage
    const cardColumns = [0.22, 0.43, 0.64, 0.82]
    cardColumns.forEach((cx, idx) => {
      const x = size * cx
      const w = idx === 1 ? size * 0.18 : size * 0.12
      const streak = ctx.createLinearGradient(x - w, 0, x + w, 0)
      streak.addColorStop(0, 'rgba(0,161,214,0)')
      streak.addColorStop(0.5, idx === 1 ? 'rgba(110,215,245,0.42)' : 'rgba(0,161,214,0.22)')
      streak.addColorStop(1, 'rgba(0,161,214,0)')
      ctx.fillStyle = streak
      ctx.fillRect(x - w, size * 0.35, w * 2, size * 0.65)
    })

    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])
}

/** Realistic low-profile cylindrical stage pedestal matching the reference image. */
function Pedestal() {
  const topNeonRef = useRef()
  const baseNeonRef = useRef()
  const deckTex = useStageDeckTexture()
  const glowTex = useGlowTexture()
  const hotGlowTex = useGlowTexture('rgba(150,230,250,1)', 'rgba(0,161,214,0.62)', 'rgba(10,40,60,0)')

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (topNeonRef.current) topNeonRef.current.material.opacity = 0.94 + Math.sin(t * 2.2) * 0.06
    if (baseNeonRef.current) baseNeonRef.current.material.opacity = 0.9 + Math.cos(t * 1.8) * 0.08
  })

  return (
    <group position={[0, -0.18, 0]}>
      {/* Main dark metallic cylinder body (dark vertical wall between top & bottom neon rings) */}
      <mesh position-y={0.08}>
        <cylinderGeometry args={[4.85, 4.92, 0.38, 180]} />
        <meshStandardMaterial
          color="#0b1c28"
          metalness={0.95}
          roughness={0.18}
          emissive="#10384e"
          emissiveIntensity={0.28}
        />
      </mesh>

      {/* Reflective brushed top stage deck where the cards stand */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.272}>
        <circleGeometry args={[4.84, 180]} />
        <meshStandardMaterial
          map={deckTex}
          metalness={0.85}
          roughness={0.2}
          emissive="#0f3a52"
          emissiveIntensity={0.45}
        />
      </mesh>

      {/* Stepped outer base lip at water level */}
      <mesh position-y={-0.12}>
        <cylinderGeometry args={[5.05, 5.14, 0.08, 180]} />
        <meshStandardMaterial color="#040a16" metalness={0.92} roughness={0.25} />
      </mesh>

      {/* TOP RIM: Crisp hot-white/cyan neon tube */}
      <mesh ref={topNeonRef} rotation-x={Math.PI / 2} position-y={0.27}>
        <torusGeometry args={[4.85, 0.032, 24, 220]} />
        <meshBasicMaterial color={HOT_WHITE} transparent blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* TOP RIM: Inner & outer electric-blue bloom halo */}
      <mesh rotation-x={Math.PI / 2} position-y={0.27}>
        <torusGeometry args={[4.85, 0.11, 24, 220]} />
        <meshBasicMaterial
          color={BLUE}
          transparent
          opacity={0.52}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* BOTTOM RIM: Bright cyan neon ring at the base of the stage */}
      <mesh ref={baseNeonRef} rotation-x={Math.PI / 2} position-y={-0.09}>
        <torusGeometry args={[5.06, 0.038, 24, 220]} />
        <meshBasicMaterial color={CYAN} transparent blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>

      {/* BOTTOM RIM: Wide neon bloom spilling onto the wet floor */}
      <mesh rotation-x={Math.PI / 2} position-y={-0.09}>
        <torusGeometry args={[5.06, 0.16, 24, 220]} />
        <meshBasicMaterial
          color={BLUE}
          transparent
          opacity={0.62}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle outer water-surface ripple ring */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.145}>
        <ringGeometry args={[5.42, 5.47, 200]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.38}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Top-deck ambient light pool */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.276}>
        <planeGeometry args={[9.4, 9.4]} />
        <meshBasicMaterial map={glowTex} transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Intense cyan reflection hotspot directly under active card 02 */}
      <mesh rotation-x={-Math.PI / 2} position={[-0.75, 0.28, 1.45]}>
        <planeGeometry args={[4.4, 2.8]} />
        <meshBasicMaterial map={hotGlowTex} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>

      {/* Forefront water reflection pool beneath the pedestal */}
      <mesh rotation-x={-Math.PI / 2} position={[-0.3, -0.15, 2.1]}>
        <planeGeometry args={[16, 8]} />
        <meshBasicMaterial map={hotGlowTex} transparent opacity={0.78} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}

/** Rotating tick ring, segmented arcs and an outward pulse ripple on the deck. */
function HudRings() {
  const ticksRef = useRef()
  const arcsRef = useRef()
  const pulseRef = useRef()

  const ticks = useMemo(() => Array.from({ length: 96 }, (_, i) => i), [])

  useFrame(({ clock }, dt) => {
    ticksRef.current.rotation.z += dt * 0.12
    arcsRef.current.rotation.z -= dt * 0.35
    const p = (clock.getElapsedTime() * 0.4) % 1
    pulseRef.current.scale.setScalar(1 + p * 0.42)
    pulseRef.current.material.opacity = (1 - p) * 0.6
  })

  return (
    <group position={[0, -0.18, 0]}>
      <group rotation-x={-Math.PI / 2} position-y={0.29}>
        <group ref={ticksRef}>
          {ticks.map((i) => {
            const a = (i / ticks.length) * Math.PI * 2
            const long = i % 8 === 0
            return (
              <mesh key={i} position={[Math.cos(a) * 4.55, Math.sin(a) * 4.55, 0]} rotation-z={a + Math.PI / 2}>
                <planeGeometry args={[0.03, long ? 0.3 : 0.12]} />
                <meshBasicMaterial
                  color={CYAN}
                  transparent
                  opacity={long ? 0.9 : 0.5}
                  blending={THREE.AdditiveBlending}
                  toneMapped={false}
                  depthWrite={false}
                />
              </mesh>
            )
          })}
        </group>
        <group ref={arcsRef}>
          {[0, 1, 2].map((i) => (
            <mesh key={i}>
              <ringGeometry args={[4.12, 4.17, 64, 1, (i * Math.PI * 2) / 3, Math.PI / 2.2]} />
              <meshBasicMaterial
                color={BLUE}
                transparent
                opacity={0.85}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      </group>

      <mesh ref={pulseRef} rotation-x={-Math.PI / 2} position-y={-0.09}>
        <ringGeometry args={[5.1, 5.16, 200]} />
        <meshBasicMaterial
          color={CYAN}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/** Slowly rising dust / light particles. */
function Particles({ count = 260 }) {
  const ref = useRef()
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = Math.random() * 8 - 1
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
      speeds[i] = 0.06 + Math.random() * 0.18
    }
    return { positions, speeds }
  }, [count])

  const sprite = useGlowTexture('rgba(160,230,250,1)', 'rgba(0,161,214,0.4)', 'rgba(0,161,214,0)')

  useFrame((_, dt) => {
    const arr = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * dt
      arr[i * 3] += Math.sin(arr[i * 3 + 1] + i) * 0.002
      if (arr[i * 3 + 1] > 7.5) arr[i * 3 + 1] = -1
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.075}
        sizeAttenuation
        transparent
        opacity={0.72}
        color="#8fdcf5"
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/** Low-angle camera matching the flat ellipse perspective of the stage in the reference image. */
function CameraRig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x += (pointer.x * 0.28 - camera.position.x) * 0.04
    camera.position.y += (0.82 + pointer.y * 0.1 - camera.position.y) * 0.04
    camera.lookAt(0, 0.22, 0)
  })
  return null
}

export default function PlatformScene() {
  return (
    <Canvas
      className="platform-canvas"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.82, 11.2], fov: 28 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.45} color="#4a90b0" />
      <pointLight position={[-0.7, 2.4, 3.8]} intensity={75} color="#00A1D6" distance={16} />
      <pointLight position={[1.8, 1.6, 2.5]} intensity={35} color="#4cc9ee" distance={12} />
      <directionalLight position={[-4, 5, 4]} intensity={0.7} color="#bfe6f5" />

      <Pedestal />
      <HudRings />
      <Particles />
      <CameraRig />
    </Canvas>
  )
}
