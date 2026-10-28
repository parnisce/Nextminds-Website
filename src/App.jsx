import { useEffect } from 'react'
import Lenis from 'lenis'
import Hero from './components/Hero'
import Work from './components/Work'
import { About, WhyUs, Testimonials, FAQ, CTA, Footer } from './components/Sections'

function App() {
  // Smooth scrolling, plus anchor links that glide to their section.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
    let raf = requestAnimationFrame(function tick(t) {
      lenis.raf(t)
      raf = requestAnimationFrame(tick)
    })

    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const hash = a.getAttribute('href')
      const target = hash.length > 1 ? document.querySelector(hash) : null
      if (hash === '#' || target) {
        e.preventDefault()
        lenis.scrollTo(target || 0, { duration: 1.3 })
      }
    }
    document.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('click', onClick)
      lenis.destroy()
    }
  }, [])

  // Fade sections in as they enter the viewport.
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <main>
      <Hero />
      <About />
      <Work />
      <WhyUs />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  )
}

export default App
