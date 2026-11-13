import { Brain, Eye, Kanban, Lightbulb, Lightning, SealCheck, ShieldCheck, Target, TrendUp, UsersThree } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useHome, type HomeContent } from "@/lib/content";
import type { ElementType, ReactNode } from "react";

import "./site.css";

export const PHONE = "(289) 690-1777";
export const EMAIL = "info@nextminds.com";
export const ADDRESS = "27 Bounty Avenue, Thorold, ON L2V 0H3, Canada";

export const services = [
  {
    name: "AI Agent Development",
    slug: "ai-agents-development",
    short: "AI Agent",
    category: "AI & Automation",
    image: "/assets/services/ai.jpg",
    href: "https://nextminds.com/ai-agents-development/",
    lead: "Custom AI agents that work for your business.",
    text: "We design, train and deploy custom AI agents that handle support, sales and operations around the clock, wired into the tools your team already uses.",
    features: ["Autonomous workflows", "Chat & voice agents", "CRM & API integrations", "Custom LLM training"],
  },
  {
    name: "Web Digital Agency",
    slug: "digital-agency",
    short: "Web Digital",
    category: "Web & Digital",
    image: "/assets/services/web.jpg",
    href: "https://nextminds.com/digital-agency/",
    lead: "Modern websites and digital solutions that drive growth.",
    text: "Fast, conversion-focused websites and web apps, designed and built end to end by one team, from brand-led UI to clean, scalable code.",
    features: ["Custom web design", "React & Next.js builds", "SEO & performance", "E-commerce"],
  },
  {
    name: "Real Estate Services",
    slug: "real-estate-media",
    short: "Real Estate",
    category: "Real Estate Media",
    image: "/assets/services/real-estate.jpg",
    href: "https://nextminds.com/real-estate-media/",
    lead: "Professional real estate media and marketing solutions.",
    text: "Photography, video tours and listing marketing that make properties stand out and sell faster, delivered with a consistent, premium look.",
    features: ["HDR photography", "Video & drone tours", "Virtual staging", "Listing websites"],
  },
  {
    name: "Media Production",
    slug: "media-production",
    short: "Media",
    category: "Video Production",
    image: "/assets/services/media.jpg",
    href: "https://nextminds.com/media-production/",
    lead: "High-quality video production and content creation.",
    text: "Cinematic video production from concept to final cut: brand films, social content and campaigns shot and edited in-house.",
    features: ["Brand films", "Social content", "Motion graphics", "Post-production"],
  },
];

export const b2cServices = [
  {
    name: "Online Education",
    short: "Online Education",
    slug: "online-education",
    category: "Education",
    image: "/assets/services/online-education.jpg",
    lead: "Online courses and learning programs that people finish.",
    text: "We help educators, coaches and businesses turn their expertise into engaging online programs, from course structure and recorded lessons to the pages and tools that deliver them.",
    features: ["Course design", "Lesson video production", "Student portals", "Live & recorded classes"],
  },
  {
    name: "Photo and Video Portraiture",
    short: "Portraiture",
    slug: "photo-video-portraiture",
    category: "Portraiture",
    image: "/assets/services/portraiture.jpg",
    lead: "Portraits that look like you at your best.",
    text: "Professional photo and video portraits for individuals, teams and brands, from headshots to personal brand films, lit, directed and retouched with care.",
    features: ["Headshots", "Personal brand video", "Team & corporate portraits", "Retouching"],
  },
  {
    name: "E-Learning Platforms",
    short: "E-Learning",
    slug: "e-learning-platforms",
    category: "E-Learning",
    image: "/assets/services/e-learning.jpg",
    lead: "Learning platforms built around your content.",
    text: "Custom e-learning sites and platforms with course delivery, progress tracking and secure student access, designed so learners can focus on learning.",
    features: ["Course delivery", "Progress tracking", "Memberships & access", "Quizzes & certificates"],
  },
  {
    name: "E-Commerce Services",
    short: "E-Commerce",
    slug: "e-commerce-services",
    category: "E-Commerce",
    image: "/assets/services/e-commerce.jpg",
    lead: "Online stores that make it easy to buy.",
    text: "Design, build and launch of online stores, from product pages and checkout to payments, shipping and the marketing that brings customers in.",
    features: ["Store design & build", "Payments & shipping", "Product photography", "Marketing & SEO"],
  },
];

export type ServiceItem = (typeof services)[number] | (typeof b2cServices)[number];
export const allServices: ServiceItem[] = [...services, ...b2cServices];

const valueIcons = [Lightbulb, Kanban, SealCheck, ShieldCheck];

const reasons = [
  { icon: Brain, title: "AI-first thinking", text: "We build automation and intelligence into every project, not as an afterthought." },
  { icon: UsersThree, title: "One team, four skills", text: "Strategy, design, development and production in-house, with no hand-offs." },
  { icon: Lightning, title: "Fast, focused delivery", text: "Clear milestones and quick iterations so you see progress every week." },
  { icon: TrendUp, title: "Built to scale", text: "Clean, modern code and systems that grow with your business." },
  { icon: Eye, title: "Transparent process", text: "Straight answers, honest timelines and no surprises on scope or cost." },
  { icon: Target, title: "Results you can measure", text: "We tie the work to the goals that matter: leads, sales and time saved." },
];

export function Arrow({ size = 18 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** Settles content into place with a transform only, so it is never invisible. */
export function Rise({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      className={`nm-rise ${seen ? "is-in" : ""} ${className}`.trim()}
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

const navLinks = [
  ["Home", "#"],
  ["Services", "#services"],
  ["About Us", "#about"],
  ["Why Us", "#why"],
  ["Testimonials", "#clients"],
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const onHome = useLocation({ select: (l) => l.pathname === "/" });
  const close = () => setOpen(false);

  return (
    <header className="nm-nav">
      {onHome ? (
        <a aria-label="NextMinds home" className="nm-nav__logo" href="#">
          <img alt="NextMinds" height={46} src="/assets/brand/logo.png" width={177} />
        </a>
      ) : (
        <Link aria-label="NextMinds home" className="nm-nav__logo" to="/">
          <img alt="NextMinds" height={46} src="/assets/brand/logo.png" width={177} />
        </Link>
      )}
      <button
        aria-controls="nm-links"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="nm-nav__toggle"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {open ? "✕" : "☰"}
      </button>
      <nav className={`nm-nav__links ${open ? "is-open" : ""}`} id="nm-links">
        {navLinks.map(([label, href]) =>
          onHome ? (
            <a href={href} key={href} onClick={close}>
              {label}
            </a>
          ) : (
            <a href={href === "#" ? "/" : `/${href}`} key={href} onClick={close}>
              {label}
            </a>
          ),
        )}
        <Link onClick={close} to="/blog">
          Blog
        </Link>
        <Link className="nm-navcta" onClick={close} to="/contact">
          Contact Us
        </Link>
      </nav>
    </header>
  );
}

export function HeroActions() {
  return (
    <>
      <Link className="nm-heroA" to="/contact">
        <span className="nm-heroA__l">
          <span>Let&rsquo;s Talk</span>
          <span aria-hidden="true">Let&rsquo;s Talk</span>
        </span>
      </Link>
      <a className="nm-heroB" href="#services">
        Our Services <Arrow />
      </a>
    </>
  );
}

export function Services() {
  const track = useRef<HTMLDivElement>(null);
  const texts = useRef<(HTMLElement | null)[]>([]);
  const layers = useRef<(HTMLElement | null)[]>([]);
  const bars = useRef<(HTMLElement | null)[]>([]);
  const counter = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const n = services.length;
    const per = 0.9;
    const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const mq = window.matchMedia("(max-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pad = (v: number) => String(v).padStart(2, "0");

    let current = 0;
    let raf = 0;

    const reset = () => {
      [...texts.current, ...layers.current].forEach((node) => {
        if (!node) return;
        node.style.opacity = "";
        node.style.transform = "";
        node.style.pointerEvents = "";
        node.style.zIndex = "";
      });
    };

    const paint = (f: number) => {
      services.forEach((_, i) => {
        const d = i - f;
        const t = texts.current[i];
        const l = layers.current[i];
        if (!t || !l) return;
        const o = 1 - clamp(Math.abs(d) * 1.7);
        t.style.opacity = String(o);
        t.style.transform = `translate3d(0, ${d * 46}px, 0)`;
        t.style.pointerEvents = o > 0.6 ? "auto" : "none";
        l.style.opacity = String(1 - clamp(Math.abs(d) * 1.35));
        l.style.transform = `translate3d(0, ${d * 9}%, 0) scale(${1 - Math.min(Math.abs(d), 1) * 0.06})`;
        l.style.zIndex = d > 0 ? "1" : "2";
        const b = bars.current[i];
        if (b) b.style.transform = `scaleX(${clamp(f - i + 1)})`;
      });
      if (counter.current) counter.current.textContent = `${pad(Math.round(f) + 1)} / ${pad(n)}`;
    };

    const target = () => {
      const span = (n - 1) * per * window.innerHeight;
      return clamp(-el.getBoundingClientRect().top / span) * (n - 1);
    };

    // Eased follow loop: glides toward the scroll position so the pinned
    // transitions feel fluid rather than stepping with the wheel.
    const tick = () => {
      if (mq.matches || reduced) {
        reset();
        raf = 0;
        return;
      }
      const goal = target();
      current += (goal - current) * 0.12;
      if (Math.abs(goal - current) < 0.0005) current = goal;
      paint(current);
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf) {
            current = target();
            raf = requestAnimationFrame(tick);
          }
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    io.observe(el);
    paint(0);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="nm-work" id="services">
      <div aria-hidden="true" className="nm-work__glow" />
      <div className="nm-work__track" ref={track} style={{ "--n": services.length, "--per": 0.9 } as React.CSSProperties}>
        <div className="nm-work__stage">
          <div className="nm-work__texts">
            {services.map((s, i) => (
              <article className="nm-work__text" key={s.name} ref={(node) => { texts.current[i] = node; }}>
                <span className="nm-work__meta">
                  <i /> 0{i + 1} / {s.category}
                </span>
                <h3 className="nm-work__name">{s.name}</h3>
                <p className="nm-work__lead">{s.lead}</p>
                <p className="nm-work__desc">{s.text}</p>
                <ul className="nm-work__chips">
                  {s.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <div className="nm-work__actions">
                  <Link className="nm-work__btn nm-work__btn--solid" params={{ slug: s.slug }} to="/services/$slug">
                    Explore {s.short} <Arrow size={16} />
                  </Link>
                  <Link className="nm-work__btn nm-work__btn--ghost" to="/contact">
                    Start a project
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="nm-work__right">
            <div aria-hidden="true" className="nm-work__media">
              {services.map((s, i) => (
                <div className="nm-work__layer" key={s.image} ref={(node) => { layers.current[i] = node; }}>
                  <img alt="" decoding="async" draggable={false} loading="lazy" src={s.image} />
                </div>
              ))}
            </div>
            <div className="nm-work__nav">
              <span ref={counter}>01 / 0{services.length}</span>
              <div className="nm-work__bars">
                {services.map((s, i) => (
                  <span key={s.name}>
                    <b ref={(node) => { bars.current[i] = node; }} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="nm-work__spacer" />
      </div>
    </section>
  );
}

export function About() {
  const { about } = useHome();
  const list = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      const rect = el.getBoundingClientRect();
      setProgress(Math.min(1, Math.max(0, (mid - rect.top) / rect.height)));
      let best = 0;
      let bestDist = Infinity;
      items.current.forEach((node, i) => {
        if (!node) return;
        const r = node.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="nm-section nm-section--deep" id="about">
      <div className="nm-wrap nm-about2__grid">
        <div className="nm-about2__left">
          <div className="nm-about2__sticky">
            <Rise>
              <p className="nm-label">Who is NextMinds</p>
              <h2 className="nm-h2">
                A digital studio for <span className="nm-accent">what&rsquo;s next.</span>
              </h2>
            </Rise>
            <Rise className="nm-about2__copy" delay={100}>
              {about.intro.map((p) => (
                <p className="nm-body" key={p}>
                  {p}
                </p>
              ))}
            </Rise>
            <dl className="nm-stats">
              {about.stats.map(({ value, label }, i) => (
                <div key={i}>
                  <dt>{value}</dt>
                  <dd>{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="nm-journey" ref={list}>
          <span aria-hidden="true" className="nm-journey__track" />
          <span aria-hidden="true" className="nm-journey__fill" style={{ height: `${progress * 100}%` }} />
          <span aria-hidden="true" className="nm-journey__head" style={{ top: `${progress * 100}%` }} />
          {about.values.map(({ title, text }, i) => {
            const Icon = valueIcons[i] ?? Lightbulb;
            return (
            <article
              className={`nm-journey__item ${i === active ? "is-active" : ""}`}
              key={i}
              ref={(node) => {
                items.current[i] = node;
              }}
            >
              <p className="nm-journey__num">0{i + 1}</p>
              <div>
                <span className="nm-journey__icon">
                  <Icon aria-hidden size={28} weight="duotone" />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Why() {
  return (
    <section className="nm-section" id="why">
      <div className="nm-wrap">
        <Rise>
          <p className="nm-label">Why choose us</p>
          <h2 className="nm-h2">
            Reasons businesses <span className="nm-accent">pick NextMinds.</span>
          </h2>
        </Rise>
        <div className="nm-why__grid">
          {reasons.map(({ icon: Icon, title, text }, i) => (
            <Rise className="nm-why__card" delay={(i % 3) * 90} key={title}>
              <span className="nm-why__icon">
                <Icon aria-hidden size={26} weight="duotone" />
              </span>
              <span className="nm-why__num">0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="nm-why__line" />
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuoteCard({ quote, name, role }: HomeContent["testimonials"][number]) {
  return (
    <figure className="nm-qcard">
      <span aria-hidden="true" className="nm-qcard__mark">
        &ldquo;
      </span>
      <blockquote>{quote}</blockquote>
      <figcaption>
        <span className="nm-qcard__avatar">{name[0]}</span>
        <span>
          <b>{name}</b>
          <small>{role}</small>
        </span>
      </figcaption>
    </figure>
  );
}

function QuoteRow({ items, reverse = false }: { items: HomeContent["testimonials"]; reverse?: boolean }) {
  return (
    <div className={`nm-marquee ${reverse ? "is-reverse" : ""}`}>
      {[0, 1, 2, 3].map((copy) => (
        <div aria-hidden={copy > 0} className="nm-marquee__group" key={copy}>
          {items.map((c, i) => (
            <QuoteCard key={`${c.name}-${i}`} {...c} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Clients() {
  const { testimonials: clients } = useHome();
  const firstRow = clients;
  const secondRow = [...clients.slice(3), ...clients.slice(0, 3)];

  return (
    <section className="nm-section nm-section--clients" id="clients">
      <div className="nm-wrap">
        <Rise>
          <p className="nm-label">Testimonials</p>
          <h2 className="nm-h2">
            Trusted by the people <span className="nm-accent">we work with.</span>
          </h2>
        </Rise>
      </div>
      <div className="nm-quotes">
        <QuoteRow items={firstRow} />
        <QuoteRow items={secondRow} reverse />
        <div aria-hidden="true" className="nm-quotes__fade nm-quotes__fade--l" />
        <div aria-hidden="true" className="nm-quotes__fade nm-quotes__fade--r" />
      </div>
    </section>
  );
}

export function Faq() {
  const { faqs } = useHome();
  const [open, setOpen] = useState(0);

  return (
    <section className="nm-section" id="faq">
      <div className="nm-wrap nm-faq">
        <Rise>
          <p className="nm-label">FAQ</p>
          <h2 className="nm-h2">
            Questions, <span className="nm-accent">answered.</span>
          </h2>
          <p className="nm-body">Can&rsquo;t find what you need? Reach out and we&rsquo;ll get back to you quickly.</p>
        </Rise>
        <div className="nm-faq__list">
          {faqs.map(({ q, a }, i) => (
            <Rise className={`nm-faq__item ${open === i ? "is-open" : ""}`} delay={i * 60} key={`${q}-${i}`}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)} type="button">
                <span>{q}</span>
                <i aria-hidden="true" />
              </button>
              <div className="nm-faq__body">
                <p>{a}</p>
              </div>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const { cta } = useHome();
  return (
    <section className="nm-section nm-section--contact" id="contact">
      <div className="nm-cta">
        <div aria-hidden="true" className="nm-cta__grid" />
        <div aria-hidden="true" className="nm-cta__orb nm-cta__orb--a" />
        <div aria-hidden="true" className="nm-cta__orb nm-cta__orb--b" />

        <Rise className="nm-cta__inner">
          <p className="nm-cta__badge">
            <i /> {cta.badge}
          </p>
          <h2 className="nm-cta__title">
            {cta.title} <span>{cta.accent}</span>
          </h2>
          <p className="nm-cta__lede">{cta.lede}</p>
          <div className="nm-cta__actions">
            <Link className="nm-pill" to="/contact">
              Let&rsquo;s Talk
              <i>
                <Arrow size={20} />
              </i>
            </Link>
            <a className="nm-cta__ghost" href="tel:+12896901777">
              Call {PHONE}
            </a>
          </div>
        </Rise>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="nm-footer">
      <div className="nm-wrap">
        <div className="nm-footer__top">
          <div className="nm-footer__brand">
            <img alt="NextMinds" height={36} src="/assets/brand/logo.png" width={139} />
            <p>
              We are driven by a shared commitment to excellence, innovation, and client satisfaction. We become your trusted
              partner on the way to success.
            </p>
          </div>
          <div>
            <h4>B2B services</h4>
            <ul>
              <li>
                <Link params={{ slug: "digital-agency" }} to="/services/$slug">
                  Digital Agency
                </Link>
              </li>
              <li>
                <Link params={{ slug: "real-estate-media" }} to="/services/$slug">
                  Real Estate Services
                </Link>
              </li>
              <li>
                <Link params={{ slug: "ai-agents-development" }} to="/services/$slug">
                  AI Development Services
                </Link>
              </li>
              <li>
                <Link params={{ slug: "media-production" }} to="/services/$slug">
                  Media Production
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>B2C services</h4>
            <ul>
              {b2cServices.map((item) => (
                <li key={item.slug}>
                  <Link params={{ slug: item.slug }} to="/services/$slug">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="tel:+12896901777">{PHONE}</a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </li>
              <li>{ADDRESS}</li>
              <li>
                <Link to="/contact">Contact page</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="nm-footer__bottom">
          &copy; 2001-{new Date().getFullYear()} NextMinds Business Solutions. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
