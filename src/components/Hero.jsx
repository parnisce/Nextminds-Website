import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import Navbar from './Navbar'
import CardCarousel from './CardCarousel'
import { ArrowRight, Play } from './Icons'

gsap.registerPlugin(useGSAP)

export default function Hero() {
  const root = useRef(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduce) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('[data-anim="bg"]', { scale: 1.1, opacity: 0, duration: 1.8, ease: 'power2.out' })
        .from('[data-anim="nav"] > *', { y: -20, opacity: 0, duration: 0.7, stagger: 0.08, clearProps: 'all' }, 0.15)
        .from('[data-anim="eyebrow"]', { x: -24, opacity: 0, duration: 0.7, clearProps: 'all' }, 0.35)
        .from('.hero__title-line', { y: 36, opacity: 0, duration: 0.85, stagger: 0.12, clearProps: 'all' }, 0.45)
        .from('[data-anim="copy"]', { y: 20, opacity: 0, duration: 0.75, clearProps: 'all' }, 0.85)
        .from('[data-anim="cta"] > *', { y: 18, opacity: 0, duration: 0.65, stagger: 0.1, clearProps: 'all' }, 1.0)
        .from('[data-anim="platform"]', { opacity: 0, y: 40, duration: 1.3, ease: 'power2.out', clearProps: 'opacity,transform' }, 0.35)
        .from('[data-anim="controls"]', { y: 16, opacity: 0, duration: 0.7, clearProps: 'opacity' }, 1.15)
        .from('[data-anim="foot"]', { opacity: 0, duration: 0.9, clearProps: 'opacity' }, 1.25)

      // Light rays slowly breathing.
      gsap.to('.hero__rays', { opacity: 0.55, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    },
    { scope: root },
  )

  return (
    <section className="hero" id="home" ref={root}>
      <div className="hero__bg" data-anim="bg" aria-hidden="true" />
      <div className="hero__rays" aria-hidden="true" />
      <div className="hero__vignette" aria-hidden="true" />

      <Navbar />

      <div className="hero__inner">
        <div className="hero__content">
          <p className="hero__eyebrow" data-anim="eyebrow">
            Digital experiences for a smarter tomorrow
          </p>
          <h1 className="hero__title">
            <span className="hero__title-line">Ideas</span>
            <span className="hero__title-line">Built for</span>
            <span className="hero__title-line hero__title-line--accent">What&rsquo;s next.</span>
          </h1>
          <p className="hero__copy" data-anim="copy">
            We help businesses grow through technology, creativity and digital solutions. From AI to websites, real
            estate media and content production — we turn ideas into real results.
          </p>
          <div className="hero__cta" data-anim="cta">
            <a href="#services" className="btn btn--glow">
              Explore Our Services <ArrowRight width={18} />
            </a>
            <button type="button" className="play">
              <span className="play__icon">
                <Play width={14} />
              </span>
              Watch Showreel
            </button>
          </div>
        </div>

        <div className="hero__visual">
          <CardCarousel />
        </div>
      </div>

      <div className="hero__bottom">
        <div className="hero__scroll" data-anim="foot">
          <span className="hero__scroll-line hero__scroll-line--top" />
          <span className="mouse">
            <span className="mouse__wheel" />
          </span>
          <span className="hero__scroll-line hero__scroll-line--bottom" />
          <span className="hero__scroll-label">Scroll to explore</span>
        </div>

        <div className="hero__tags" data-anim="foot">
          Technology <span>/</span> Creativity <span>/</span> Growth
          <i />
        </div>
      </div>
    </section>
  )
}
