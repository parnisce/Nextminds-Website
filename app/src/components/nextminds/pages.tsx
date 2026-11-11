import {
  Armchair,
  Brain,
  Camera,
  ChatsCircle,
  Code,
  EnvelopeSimple,
  FilmSlate,
  Globe,
  MagnifyingGlass,
  MapPin,
  PaintBrush,
  PhoneCall,
  PlugsConnected,
  Robot,
  Scissors,
  ShareNetwork,
  ShoppingCart,
  Sparkle,
  AirplaneTilt,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { ADDRESS, Arrow, EMAIL, Footer, Nav, PHONE, Rise, services } from "./site";
import { SmoothScroll } from "./smooth-scroll";
import "./site.css";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main className="nm-page">{children}</main>
      <Footer />
    </>
  );
}

type Detail = {
  included: { icon: Icon; title: string; text: string }[];
  steps: [string, string][];
};

const defaultSteps = (verb: string): [string, string][] => [
  ["Discover", "We learn your goals, audience and constraints so the work starts from what actually matters."],
  ["Plan", "A clear scope, timeline and approach, agreed with you before anything is built."],
  [verb, "Our team does the work, sharing progress along the way so there are no surprises."],
  ["Launch & support", "We ship it, hand it over properly and stay close for whatever comes next."],
];

const details: Record<string, Detail> = {
  "ai-agents-development": {
    included: [
      { icon: Robot, title: "Autonomous workflows", text: "Agents that carry a task from start to finish, such as triaging requests, updating records and following up." },
      { icon: ChatsCircle, title: "Chat & voice agents", text: "Conversational assistants for support and sales that answer in your voice, around the clock." },
      { icon: PlugsConnected, title: "CRM & API integrations", text: "Connected to the tools your team already uses, so nothing has to be copied between systems." },
      { icon: Brain, title: "Custom LLM training", text: "Models grounded in your own content and processes, so answers are accurate and on-brand." },
    ],
    steps: defaultSteps("Build & train"),
  },
  "digital-agency": {
    included: [
      { icon: PaintBrush, title: "Custom web design", text: "Brand-led interfaces designed around your customers and the action you want them to take." },
      { icon: Code, title: "React & Next.js builds", text: "Clean, scalable front-end code that is quick to load and easy to extend." },
      { icon: MagnifyingGlass, title: "SEO & performance", text: "Technical foundations and page speed that help you get found and keep visitors engaged." },
      { icon: ShoppingCart, title: "E-commerce", text: "Online stores with smooth checkout, product management and the integrations you need." },
    ],
    steps: defaultSteps("Design & build"),
  },
  "real-estate-media": {
    included: [
      { icon: Camera, title: "HDR photography", text: "Bright, balanced listing photos that show every room at its best." },
      { icon: AirplaneTilt, title: "Video & drone tours", text: "Walk-through video and aerial footage that gives buyers the full picture of a property." },
      { icon: Armchair, title: "Virtual staging", text: "Furnish empty rooms digitally so buyers can imagine living in the space." },
      { icon: Globe, title: "Listing websites", text: "A dedicated page for each property, with media, details and enquiry in one place." },
    ],
    steps: defaultSteps("Shoot & edit"),
  },
  "media-production": {
    included: [
      { icon: FilmSlate, title: "Brand films", text: "Story-led films that explain who you are and why it matters, shot with a cinematic eye." },
      { icon: ShareNetwork, title: "Social content", text: "Short-form video built for the feed, sized and paced for each platform." },
      { icon: Sparkle, title: "Motion graphics", text: "Animated titles, explainers and graphics that make ideas easy to follow." },
      { icon: Scissors, title: "Post-production", text: "Editing, colour and sound finishing, all handled in-house from first cut to final delivery." },
    ],
    steps: defaultSteps("Produce"),
  },
};

export function ServicePage({ slug }: { slug: string }) {
  const index = services.findIndex((s) => s.slug === slug);
  const service = services[index];
  const detail = details[slug];
  if (!service || !detail) return null;
  const others = services.filter((s) => s.slug !== slug);

  return (
    <PageShell>
      <section className="nm-sp-hero">
        <div aria-hidden="true" className="nm-sp-hero__glow" />
        <div className="nm-wrap nm-sp-hero__grid">
          <div>
            <nav aria-label="Breadcrumb" className="nm-crumbs">
              <Link to="/">Home</Link>
              <span>/</span>
              <a href="/#services">Services</a>
              <span>/</span>
              <b>{service.name}</b>
            </nav>
            <p className="nm-label">
              0{index + 1} / {service.category}
            </p>
            <h1 className="nm-sp-hero__title">{service.name}</h1>
            <p className="nm-sp-hero__lead">{service.lead}</p>
            <p className="nm-sp-hero__text">{service.text}</p>
            <div className="nm-sp-hero__actions">
              <Link className="nm-work__btn nm-work__btn--solid" to="/contact">
                Start a project <Arrow size={16} />
              </Link>
              <a className="nm-work__btn nm-work__btn--ghost" href="tel:+12896901777">
                Call {PHONE}
              </a>
            </div>
          </div>
          <div className="nm-sp-hero__media">
            <img alt={service.name} src={service.image} />
          </div>
        </div>
      </section>

      <section className="nm-section nm-section--deep">
        <div className="nm-wrap">
          <Rise>
            <p className="nm-label">What&rsquo;s included</p>
            <h2 className="nm-h2">
              Everything you need, <span className="nm-accent">end to end.</span>
            </h2>
          </Rise>
          <div className="nm-sp-grid">
            {detail.included.map(({ icon: Icon, title, text }, i) => (
              <Rise className="nm-why__card" delay={(i % 2) * 90} key={title}>
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

      <section className="nm-section">
        <div className="nm-wrap">
          <Rise>
            <p className="nm-label">How we work</p>
            <h2 className="nm-h2">
              A simple process, <span className="nm-accent">no surprises.</span>
            </h2>
          </Rise>
          <ol className="nm-steps">
            {detail.steps.map(([title, text], i) => (
              <Rise as="li" className="nm-steps__item" delay={i * 80} key={title}>
                <span className="nm-steps__num">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Rise>
            ))}
          </ol>
        </div>
      </section>

      <section className="nm-section nm-section--deep">
        <div className="nm-wrap">
          <Rise>
            <p className="nm-label">More from NextMinds</p>
            <h2 className="nm-h2">
              Explore our <span className="nm-accent">other services.</span>
            </h2>
          </Rise>
          <div className="nm-sp-others">
            {others.map((o) => (
              <Link className="nm-sp-other" key={o.slug} params={{ slug: o.slug }} to="/services/$slug">
                <img alt="" loading="lazy" src={o.image} />
                <span className="nm-sp-other__body">
                  <small>{o.category}</small>
                  <b>{o.name}</b>
                  <Arrow size={18} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PageCta />
    </PageShell>
  );
}

export function PageCta() {
  return (
    <section className="nm-section nm-section--contact">
      <div className="nm-cta">
        <div aria-hidden="true" className="nm-cta__grid" />
        <div aria-hidden="true" className="nm-cta__orb nm-cta__orb--a" />
        <div aria-hidden="true" className="nm-cta__orb nm-cta__orb--b" />
        <Rise className="nm-cta__inner">
          <h2 className="nm-cta__title">
            Create a new project <span>with us.</span>
          </h2>
          <p className="nm-cta__lede">Tell us what you&rsquo;re building and we&rsquo;ll take it from there.</p>
          <div className="nm-cta__actions">
            <Link className="nm-pill" to="/contact">
              Let&rsquo;s Talk
              <i>
                <Arrow size={20} />
              </i>
            </Link>
          </div>
        </Rise>
      </div>
    </section>
  );
}

const infoCards: { icon: Icon; label: string; value: string; href?: string; note?: string }[] = [
  { icon: PhoneCall, label: "Call us", value: PHONE, href: "tel:+12896901777" },
  { icon: EnvelopeSimple, label: "Email us", value: EMAIL, href: `mailto:${EMAIL}` },
  { icon: MapPin, label: "Visit the studio", value: ADDRESS, note: "By appointment only" },
];

export function ContactPage() {
  const [sent, setSent] = useState(false);

  // No backend is wired up yet, so submitting opens the visitor's email app with the message filled in.
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const subject = `New project enquiry${get("service") ? `: ${get("service")}` : ""}`;
    const body = [
      `Name: ${get("name")}`,
      `Email: ${get("email")}`,
      get("phone") ? `Phone: ${get("phone")}` : "",
      get("service") ? `Service: ${get("service")}` : "",
      "",
      get("message"),
    ]
      .filter((line, i) => line || i === 4)
      .join("\n");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <PageShell>
      <section className="nm-sp-hero nm-sp-hero--contact">
        <div aria-hidden="true" className="nm-sp-hero__glow" />
        <div className="nm-wrap">
          <nav aria-label="Breadcrumb" className="nm-crumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <b>Contact Us</b>
          </nav>
          <p className="nm-label">Contact Us</p>
          <h1 className="nm-sp-hero__title">
            Let&rsquo;s build <span className="nm-accent">what&rsquo;s next.</span>
          </h1>
          <p className="nm-sp-hero__lead">
            Tell us about your project and we&rsquo;ll get back to you within one business day.
          </p>
        </div>
      </section>

      <section className="nm-section nm-section--deep">
        <div className="nm-wrap nm-contactpage">
          <div className="nm-contactpage__info">
            {infoCards.map(({ icon: Icon, label, value, href, note }) => {
              const body = (
                <>
                  <span className="nm-why__icon">
                    <Icon aria-hidden size={24} weight="duotone" />
                  </span>
                  <span>
                    <small>{label}</small>
                    <b>{value}</b>
                    {note ? <em>{note}</em> : null}
                  </span>
                </>
              );
              return href ? (
                <a className="nm-infocard" href={href} key={label}>
                  {body}
                </a>
              ) : (
                <div className="nm-infocard" key={label}>
                  {body}
                </div>
              );
            })}
          </div>

          <form className="nm-form" onSubmit={onSubmit}>
            <div className="nm-form__row">
              <label>
                <span>Name</span>
                <input autoComplete="name" name="name" placeholder="Your name" required type="text" />
              </label>
              <label>
                <span>Email</span>
                <input autoComplete="email" name="email" placeholder="you@company.com" required type="email" />
              </label>
            </div>
            <div className="nm-form__row">
              <label>
                <span>Phone (optional)</span>
                <input autoComplete="tel" name="phone" placeholder="(555) 000-0000" type="tel" />
              </label>
              <label>
                <span>I&rsquo;m interested in</span>
                <select defaultValue="" name="service">
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s.slug} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                  <option value="Something else">Something else</option>
                </select>
              </label>
            </div>
            <label>
              <span>Tell us about your project</span>
              <textarea name="message" placeholder="What are you looking to build?" required rows={6} />
            </label>
            <button className="nm-work__btn nm-work__btn--solid nm-form__submit" type="submit">
              Send message <Arrow size={16} />
            </button>
            {sent ? (
              <p className="nm-form__note" role="status">
                Your email app should open with the message ready to send. If it doesn&rsquo;t, write to {EMAIL}.
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </PageShell>
  );
}
