import { useEffect, useRef } from 'react'
import { services } from '../data/services'
import { ArrowRight } from './Icons'

// Viewport heights of scrolling spent on each service.
const SCROLL_PER_ITEM = 0.9

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const pad = (n) => String(n).padStart(2, '0')

/** Browser-style preview frame. */
function Frame({ s }) {
  return (
    <div className="work__frame">
      <div className="work__bar">
        <i />
        <i />
        <i />
        <span>{s.slug}</span>
      </div>
      <div className="work__shot">
        <img src={s.image} alt="" draggable="false" />
      </div>
    </div>
  )
}

export default function Work() {
  const trackRef = useRef(null)
  const textRefs = useRef([])
  const frameRefs = useRef([])
  const barRefs = useRef([])
  const counterRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const n = services.length
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const narrow = () => window.matchMedia('(max-width: 1024px)').matches

    let raf = 0

    const clearInline = () => {
      ;[...textRefs.current, ...frameRefs.current].forEach((el) => {
        el.style.opacity = ''
        el.style.transform = ''
        el.style.pointerEvents = ''
        el.style.zIndex = ''
      })
    }

    const update = () => {
      raf = 0
      if (reduced || narrow()) {
        clearInline()
        return
      }

      const vh = window.innerHeight
      const span = (n - 1) * SCROLL_PER_ITEM * vh
      const f = clamp(-track.getBoundingClientRect().top / span) * (n - 1)

      services.forEach((_, i) => {
        const d = i - f
        const a = 1 - clamp(Math.abs(d) * 1.7)
        const text = textRefs.current[i]
        const frame = frameRefs.current[i]
        text.style.opacity = a
        text.style.transform = `translateY(${d * 46}px)`
        text.style.pointerEvents = a > 0.6 ? 'auto' : 'none'
        frame.style.opacity = 1 - clamp(Math.abs(d) * 1.35)
        frame.style.transform = `translateY(${d * 9}%) scale(${1 - Math.min(Math.abs(d), 1) * 0.06})`
        frame.style.zIndex = d > 0 ? 1 : 2
        barRefs.current[i].style.transform = `scaleX(${clamp(f - i + 1)})`
      })
      counterRef.current.textContent = `${pad(Math.round(f) + 1)} / ${pad(n)}`
    }

    const request = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  }, [])

  const n = services.length

  return (
    <section className="work" id="services">
      <div className="work__glow" aria-hidden="true" />

      <div className="work__track" ref={trackRef} style={{ '--n': n, '--per': SCROLL_PER_ITEM }}>
        <div className="work__stage">
          <div className="work__texts">
            {services.map((s, i) => (
              <article className="work__text" key={s.id} ref={(el) => (textRefs.current[i] = el)}>
                <span className="work__meta">
                  <i /> {s.id} / {s.category}
                </span>
                <h3 className="work__name">
                  {s.title[0]} {s.title[1]}
                </h3>
                <p className="work__lead">{s.description}</p>
                <p className="work__desc">{s.longDescription}</p>
                <ul className="work__chips">
                  {s.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <div className="work__actions">
                  <a href="#contact" className="btn btn--solid">
                    Explore {s.title[0]} <ArrowRight width={16} />
                  </a>
                  <a href="#contact" className="btn btn--ghost">
                    Start a project
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="work__right">
            <div className="work__media">
              {services.map((s, i) => (
                <div className="work__layer" key={s.id} ref={(el) => (frameRefs.current[i] = el)}>
                  <Frame s={s} />
                </div>
              ))}
            </div>

            <div className="work__nav">
              <span ref={counterRef}>{`01 / ${pad(n)}`}</span>
              <div className="work__bars">
                {services.map((s, i) => (
                  <span key={s.id}>
                    <b ref={(el) => (barRefs.current[i] = el)} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="work__spacer" />
      </div>
    </section>
  )
}
