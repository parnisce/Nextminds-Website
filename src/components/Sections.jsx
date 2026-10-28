import { useState } from 'react'
import { ArrowRight } from './Icons'

/* ---------------------------------------------------------------- About */
const pillars = [
  ['AI Agent Development', 'Agents that handle support, sales and ops.'],
  ['Web Digital Agency', 'Websites and apps built to convert.'],
  ['Real Estate Services', 'Media and marketing that sells listings.'],
  ['Media Production', 'Video and content with a cinematic edge.'],
]

const stats = [
  ['50+', 'Projects delivered'],
  ['4', 'Core disciplines'],
  ['24/7', 'AI agents running'],
  ['100%', 'Client focused'],
]

export function About() {
  return (
    <section className="sec about" id="about">
      <div className="sec__inner about__grid">
        <div>
          <p className="eyebrow" data-reveal>
            Who is NextMinds
          </p>
          <h2 className="sec__title" data-reveal style={{ '--d': '80ms' }}>
            A digital studio for <span>what&rsquo;s next.</span>
          </h2>
          <p className="sec__lead" data-reveal style={{ '--d': '160ms' }}>
            NextMinds is a team of builders, designers and storytellers. We combine AI, web, real estate media and video
            production under one roof, so your ideas turn into real results without juggling five different vendors.
          </p>
          <p className="sec__text" data-reveal style={{ '--d': '220ms' }}>
            Placeholder copy: tell your story here, who you are, how you started and what you believe in.
          </p>

          <dl className="stats" data-reveal style={{ '--d': '280ms' }}>
            {stats.map(([v, l]) => (
              <div key={l}>
                <dt>{v}</dt>
                <dd>{l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ul className="pillars">
          {pillars.map(([t, d], i) => (
            <li key={t} className="pillar" data-reveal style={{ '--d': `${i * 90}ms` }}>
              <span className="pillar__num">0{i + 1}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
              <ArrowRight width={18} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Why us */
const reasons = [
  ['AI-first thinking', 'We build automation and intelligence into every project, not as an afterthought.'],
  ['One team, four skills', 'Strategy, design, development and production in-house, with no hand-offs.'],
  ['Fast, focused delivery', 'Clear milestones and quick iterations so you see progress every week.'],
  ['Built to scale', 'Clean, modern code and systems that grow with your business.'],
  ['Transparent process', 'Straight answers, honest timelines and no surprises on scope or cost.'],
  ['Results you can measure', 'We tie the work to the goals that matter: leads, sales and time saved.'],
]

export function WhyUs() {
  return (
    <section className="sec why" id="why-us">
      <div className="sec__inner">
        <header className="sec__head">
          <p className="eyebrow" data-reveal>
            Why choose us
          </p>
          <h2 className="sec__title" data-reveal style={{ '--d': '80ms' }}>
            Reasons businesses <span>pick NextMinds.</span>
          </h2>
        </header>

        <div className="why__grid">
          {reasons.map(([t, d], i) => (
            <article key={t} className="why__card" data-reveal style={{ '--d': `${(i % 3) * 90}ms` }}>
              <span className="why__num">0{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
              <span className="why__line" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Testimonials */
const quotes = [
  ['Placeholder testimonial. Replace with a real client quote about the results NextMinds delivered.', 'Client Name', 'Role, Company'],
  ['Placeholder testimonial. Short, specific and honest quotes work best here.', 'Client Name', 'Role, Company'],
  ['Placeholder testimonial. Mention the problem, the work and the outcome in a sentence or two.', 'Client Name', 'Role, Company'],
]

export function Testimonials() {
  return (
    <section className="sec" id="testimonials">
      <div className="sec__inner">
        <header className="sec__head">
          <p className="eyebrow" data-reveal>
            Testimonials
          </p>
          <h2 className="sec__title" data-reveal style={{ '--d': '80ms' }}>
            Trusted by the people <span>we work with.</span>
          </h2>
        </header>

        <div className="quotes">
          {quotes.map(([q, n, r], i) => (
            <figure key={i} className="quote" data-reveal style={{ '--d': `${i * 100}ms` }}>
              <span className="quote__mark" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote>{q}</blockquote>
              <figcaption>
                <span className="quote__avatar">{n[0]}</span>
                <span>
                  <b>{n}</b>
                  <small>{r}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- FAQ */
const faqs = [
  ['What services does NextMinds offer?', 'AI agent development, web design and development, real estate media, and video production.'],
  ['How long does a typical project take?', 'Placeholder answer. Most projects take a few weeks depending on scope. We agree on milestones up front.'],
  ['Do you work with small businesses?', 'Placeholder answer. Yes, we work with businesses of all sizes, from startups to established companies.'],
  ['How does pricing work?', 'Placeholder answer. We scope each project and quote a clear fixed price or a monthly plan.'],
  ['Can you integrate AI into our existing tools?', 'Placeholder answer. Yes, we connect agents to CRMs, calendars, help desks and your own APIs.'],
  ['What happens after launch?', 'Placeholder answer. We offer support and improvement plans so your project keeps performing.'],
]

export function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section className="sec" id="faq">
      <div className="sec__inner faq">
        <header className="sec__head">
          <p className="eyebrow" data-reveal>
            FAQ
          </p>
          <h2 className="sec__title" data-reveal style={{ '--d': '80ms' }}>
            Questions, <span>answered.</span>
          </h2>
          <p className="sec__text" data-reveal style={{ '--d': '160ms' }}>
            Can&rsquo;t find what you need? Reach out and we&rsquo;ll get back to you quickly.
          </p>
        </header>

        <div className="faq__list">
          {faqs.map(([q, a], i) => (
            <div key={q} className={`faq__item ${open === i ? 'is-open' : ''}`} data-reveal style={{ '--d': `${i * 60}ms` }}>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{q}</span>
                <i aria-hidden="true" />
              </button>
              <div className="faq__body">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- CTA */
export function CTA() {
  return (
    <section className="sec cta" id="contact">
      <div className="sec__inner">
        <div className="cta__panel" data-reveal>
          <span className="cta__glow" aria-hidden="true" />
          <p className="eyebrow">Something great starts with a hello</p>
          <h2 className="cta__title">
            Ready to build <span>what&rsquo;s next?</span>
          </h2>
          <p className="cta__text">Tell us about your project. We&rsquo;ll reply within one business day.</p>
          <div className="cta__actions">
            <a href="mailto:hello@nextminds.com" className="btn btn--solid">
              Start a Project <ArrowRight width={16} />
            </a>
            <a href="mailto:hello@nextminds.com" className="btn btn--ghost">
              hello@nextminds.com
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- Footer */
const cols = [
  ['Services', ['AI Agent Development', 'Web Digital Agency', 'Real Estate Services', 'Media Production']],
  ['Company', ['About', 'Why Us', 'Testimonials', 'FAQ']],
  ['Contact', ['hello@nextminds.com', '+00 000 000 0000', 'Your City, Country']],
]

export function Footer() {
  return (
    <footer className="footer">
      <div className="sec__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <img src="/images/logo.png" alt="NextMinds" />
            <p>Ideas built for what&rsquo;s next. AI, web, real estate media and video, under one roof.</p>
          </div>

          {cols.map(([h, items]) => (
            <div key={h} className="footer__col">
              <h4>{h}</h4>
              <ul>
                {items.map((it) => (
                  <li key={it}>
                    <a href="#">{it}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <span>&copy; {new Date().getFullYear()} NextMinds. All rights reserved.</span>
          <span className="footer__social">
            <a href="#">LinkedIn</a>
            <a href="#">Instagram</a>
            <a href="#">X</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
