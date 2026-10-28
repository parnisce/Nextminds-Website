import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { services } from '../data/services'
import { ArrowLeft, ArrowRight } from './Icons'

const PlatformScene = lazy(() => import('./PlatformScene'))

gsap.registerPlugin(useGSAP)

const AUTOPLAY_MS = 5500

// 4-slot circular ring poses (indexed by relative slot: -1 left, 0 front-active, +1 right, +2 far-right)
// Smoothly interpolated along the ring as the slider rotates continuously.
const RING_SLOTS = [
  // slot 0: active card (elevated, slightly larger, brightest neon border)
  { xFactor: -0.46, z: 40, rotY: 0, scale: 1.06, y: -30, opacity: 1, zIndex: 30, brightness: 1.05 },
  // slot 1: right of active card
  { xFactor: 0.46, z: 0, rotY: -8, scale: 0.97, y: 0, opacity: 0.97, zIndex: 20, brightness: 0.9 },
  // slot 2: far-right card
  { xFactor: 1.38, z: -30, rotY: -14, scale: 0.93, y: 6, opacity: 0.92, zIndex: 10, brightness: 0.82 },
  // slot 3 (or -1): left of active card
  { xFactor: -1.38, z: -10, rotY: 6, scale: 0.97, y: 4, opacity: 0.95, zIndex: 18, brightness: 0.9 },
]

function lerp(a, b, t) {
  return a + (b - a) * t
}

/** Smoothly interpolate between the 4 circular slots around the pedestal. */
function getCircularSlotPose(relOffset, cardW) {
  const total = RING_SLOTS.length
  // Wrap relOffset into [0, total)
  const wrapped = ((relOffset % total) + total) % total
  const idxA = Math.floor(wrapped) % total
  const idxB = (idxA + 1) % total
  const frac = wrapped - Math.floor(wrapped)

  const a = RING_SLOTS[idxA]
  const b = RING_SLOTS[idxB]

  // Add a subtle backward arc during wrap-around between far-right (slot 2) and far-left (slot 3)
  const isBackWrap = (idxA === 2 && idxB === 3) || (idxA === 3 && idxB === 2)
  const backArcZ = isBackWrap ? -Math.sin(frac * Math.PI) * 140 : 0

  const brightness = lerp(a.brightness, b.brightness, frac)

  return {
    x: lerp(a.xFactor, b.xFactor, frac) * cardW,
    z: lerp(a.z, b.z, frac) + backArcZ,
    rotationY: lerp(a.rotY, b.rotY, frac),
    scale: lerp(a.scale, b.scale, frac),
    y: lerp(a.y, b.y, frac),
    opacity: lerp(a.opacity, b.opacity, frac),
    zIndex: Math.round(lerp(a.zIndex, b.zIndex, frac)),
    filter: `brightness(${brightness.toFixed(2)})`,
  }
}

export default function CardCarousel() {
  // Start at step 1 so "02 Web Digital Agency" is the elevated featured card, matching the design
  const [step, setStep] = useState(1)
  const [paused, setPaused] = useState(false)
  const stageRef = useRef(null)
  const cardsRef = useRef([])
  const firstRun = useRef(true)
  const dragStart = useRef(null)
  const rotState = useRef({ value: 1 })

  const total = services.length
  const active = ((step % total) + total) % total

  const go = useCallback((dir) => setStep((s) => s + dir), [])

  // Rotate to a specific card index via the shortest circular path
  const goToIndex = useCallback(
    (targetIdx) => {
      setStep((curr) => {
        const currMod = ((curr % total) + total) % total
        let diff = targetIdx - currMod
        if (diff > total / 2) diff -= total
        if (diff < -total / 2) diff += total
        return curr + diff
      })
    },
    [total],
  )

  const applyRingLayout = useCallback((progress) => {
    const card = cardsRef.current[0]
    const cardW = card ? card.offsetWidth : 210

    cardsRef.current.forEach((el, i) => {
      if (!el) return
      const pose = getCircularSlotPose(i - progress, cardW)
      el.style.zIndex = pose.zIndex
      gsap.set(el, {
        x: pose.x,
        y: pose.y,
        z: pose.z,
        rotationY: pose.rotationY,
        scale: pose.scale,
        opacity: pose.opacity,
        filter: pose.filter,
      })
    })
  }, [])

  // Animate circular rotation along the 3D ring whenever `step` changes.
  useGSAP(
    () => {
      const stage = stageRef.current
      if (!stage) return

      cardsRef.current.forEach((el, i) => {
        if (el) el.classList.toggle('is-active', i === active)
      })

      if (firstRun.current) {
        rotState.current.value = step
        applyRingLayout(step)
        firstRun.current = false
        return
      }

      gsap.to(rotState.current, {
        value: step,
        duration: 1.0,
        ease: 'power3.inOut',
        overwrite: true,
        onUpdate: () => applyRingLayout(rotState.current.value),
      })
    },
    { dependencies: [step], scope: stageRef },
  )

  // Re-layout on resize.
  useEffect(() => {
    const onResize = () => applyRingLayout(rotState.current.value)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [applyRingLayout])

  // Autoplay circular rotation.
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => go(1), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, go, step])

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // Subtle 3D tilt that follows the pointer.
  const onPointerMove = (e) => {
    const rect = stageRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(stageRef.current.querySelector('.carousel__track'), {
      rotationY: px * 5,
      rotationX: -py * 3,
      duration: 1,
      ease: 'power2.out',
    })
  }

  const onPointerLeave = () => {
    setPaused(false)
    dragStart.current = null
    gsap.to(stageRef.current.querySelector('.carousel__track'), { rotationY: 0, rotationX: 0, duration: 1.2 })
  }

  return (
    <div className="carousel">
      <div
        className="carousel__stage"
        ref={stageRef}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={onPointerLeave}
        onPointerMove={onPointerMove}
        onPointerDown={(e) => (dragStart.current = e.clientX)}
        onPointerUp={(e) => {
          if (dragStart.current === null) return
          const dx = e.clientX - dragStart.current
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
          dragStart.current = null
        }}
      >
        <div className="carousel__platform" data-anim="platform" aria-hidden="true">
          <Suspense fallback={null}>
            <PlatformScene />
          </Suspense>
        </div>
        <div className="carousel__float">
        <div className="carousel__track">
          {services.map((s, i) => (
            <article
              key={s.id}
              ref={(el) => (cardsRef.current[i] = el)}
              className="card"
              data-anim="card"
              data-card-index={i}
              onClick={() => i !== active && goToIndex(i)}
            >
              <div className="card__glass" />
              <span className="card__tag" aria-hidden="true">
                <i /> NODE_{s.id}
              </span>
              <div className="card__media">
                <img src={s.image} alt="" loading="eager" draggable="false" />
                <span className="card__scan" aria-hidden="true" />
              </div>
              <div className="card__body">
                <span className="card__num" data-card-reveal>
                  {s.id}
                </span>
                <h3 className="card__title" data-card-reveal>
                  {s.title[0]}
                  <br />
                  {s.title[1]}
                </h3>
                <p className="card__desc" data-card-reveal>
                  {s.description}
                </p>
                <a
                  href="#services"
                  className="card__arrow"
                  aria-label={`Learn more about ${s.title.join(' ')}`}
                  data-card-reveal
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowRight width={16} />
                </a>
              </div>
              <span className="card__edge" />
              <span className="card__bottom-glow" />
            </article>
          ))}
        </div>
        </div>
      </div>

      <div className="carousel__controls" data-anim="controls">
        <button type="button" className="icon-btn icon-btn--sm" aria-label="Previous service" onClick={() => go(-1)}>
          <ArrowLeft width={16} />
        </button>
        <div className="carousel__dots">
          {services.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`carousel__dot ${i === active ? 'is-active' : ''}`}
              aria-label={`Go to ${s.title.join(' ')}`}
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>
        <button type="button" className="icon-btn icon-btn--sm" aria-label="Next service" onClick={() => go(1)}>
          <ArrowRight width={16} />
        </button>
      </div>
    </div>
  )
}
