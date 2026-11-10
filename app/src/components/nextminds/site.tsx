import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";

import "./site.css";

const PHONE = "(289) 690-1777";
const EMAIL = "info@nextminds.com";
const ADDRESS = "27 Bounty Avenue, Thorold, ON L2V 0H3, Canada";

const services = [
  {
    name: "AI Agent Development",
    image: "/assets/services/ai.jpg",
    href: "https://nextminds.com/ai-agents-development/",
    text: "Custom AI agents trained on your business DNA. We automate complex tasks, generate unique content, and provide real-time business intelligence.",
  },
  {
    name: "Web Digital Agency",
    image: "/assets/services/web.jpg",
    href: "https://nextminds.com/digital-agency/",
    text: "Expert web design, development, and digital marketing. Elevating your brand's online presence with a unique digital experience since 2001.",
  },
  {
    name: "Real Estate Services",
    image: "/assets/services/real-estate.jpg",
    href: "https://nextminds.com/real-estate-media/",
    text: "High-end cinematic property tours, HDR photography, and Matterport 3D walkthroughs that help your listings stand out and sell.",
  },
  {
    name: "Media Production",
    image: "/assets/services/media.jpg",
    href: "https://nextminds.com/media-production/",
    text: "Photo and video portraiture, commercial storytelling, and immersive e-learning platforms for the modern age.",
  },
];

const protocols = [
  [
    "Innovation",
    "We prioritize collaboration and innovation to drive success. By fostering effective communication and encouraging teamwork, we help clients unlock new possibilities.",
  ],
  [
    "Project Management",
    "Our team plans and executes every project with a keen eye on deadlines, milestones, and resource allocation, so outcomes land as promised.",
  ],
  [
    "Quality Assurance",
    "Quality is at the core of everything we do. Robust processes make sure our services meet the highest industry standards.",
  ],
  [
    "Security",
    "In an increasingly digital world, we take the security of your business seriously and use advanced measures to safeguard your data and digital assets.",
  ],
] as const;

const also = [
  "Expertise you can trust",
  "Cutting-edge solutions with AI",
  "Diverse product and service range",
  "Personalized approach",
  "Industry-best practices",
  "Satisfaction guaranteed",
];

const steps = [
  ["Scalability", "We can scale up to a large team as needed to provide your desired outcome."],
  ["Latest AI tools", "Our team uses the latest cutting-edge technology to give you the advantage."],
  ["Quality assurance", "Our QA team reviews and validates every part of the project, ensuring quality results."],
] as const;

const clients = [
  {
    quote: "The team was professional, responsive and most importantly, delivered results.",
    name: "Ryan B. Moore",
    role: "Financial Advisor",
  },
  {
    quote: "From design to development, their team was able to take my vision and turn it into a reality.",
    name: "Ruth Cole",
    role: "Real Estate Agent",
  },
  {
    quote: "They helped me create a social media strategy that's been driving real results for my business.",
    name: "Leila Burke",
    role: "Clinic Manager",
  },
  {
    quote: "Their attention to detail and professionalism were top-notch, and the final product exceeded our expectations.",
    name: "Glenn Nelson",
    role: "Gym Owner",
  },
  {
    quote: "Their team was very patient and always willing to make changes and tweaks until we were completely satisfied.",
    name: "Brad Wright",
    role: "Real Estate Agent",
  },
];

function Arrow({ size = 18 }: { size?: number }) {
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
function Rise({
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

  return (
    <header className="nm-nav">
      <a aria-label="NextMinds home" className="nm-nav__logo" href="#">
        <img alt="NextMinds" height={34} src="/assets/brand/logo.png" width={131} />
      </a>
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
        {navLinks.map(([label, href]) => (
          <a href={href} key={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
        <a className="nm-navcta" href="#contact" onClick={() => setOpen(false)}>
          Contact Us
        </a>
      </nav>
    </header>
  );
}

export function HeroActions() {
  return (
    <>
      <a className="nm-heroA" href="#contact">
        <span className="nm-heroA__l">
          <span>Let&rsquo;s Talk</span>
          <span aria-hidden="true">Let&rsquo;s Talk</span>
        </span>
      </a>
      <a className="nm-heroB" href="#services">
        Our Services <Arrow />
      </a>
    </>
  );
}

export function Services() {
  const [active, setActive] = useState(0);

  return (
    <section className="nm-section" id="services">
      <div className="nm-wrap">
        <Rise>
          <p className="nm-label">What we do</p>
          <h2 className="nm-h2">Four disciplines. One team.</h2>
        </Rise>

        <div className="nm-services__grid">
          <Rise className="nm-services__list">
            {services.map((s, i) => (
              <div
                className={`nm-row ${active === i ? "is-active" : ""}`}
                key={s.name}
                onFocus={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
              >
                <h3 className="nm-row__name">{s.name}</h3>
                <a aria-label={`View more about ${s.name}`} className="nm-row__go" href={s.href}>
                  <Arrow size={20} />
                </a>
                <p className="nm-row__desc">{s.text}</p>
                <img alt="" className="nm-row__thumb" loading="lazy" src={s.image} />
              </div>
            ))}
          </Rise>

          <div aria-hidden="true" className="nm-services__preview">
            {services.map((s, i) => (
              <img alt="" className={active === i ? "is-active" : ""} key={s.image} src={s.image} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="nm-section nm-section--deep" id="about">
      <div className="nm-wrap nm-about__grid">
        <Rise>
          <h2 className="nm-h2">Twenty years of helping businesses stand out.</h2>
        </Rise>
        <Rise className="nm-about__copy" delay={120}>
          <p className="nm-body">
            Welcome to NextMinds Business Solutions, where innovation meets excellence. We provide comprehensive business
            solutions for both B2B and B2C sectors, tailored to the needs of each company we work with.
          </p>
          <p className="nm-body">
            Registered in 2001, with over 20 years in business, we have the knowledge, experience and expertise to elevate
            your brand&rsquo;s online image and provide a unique digital experience.
          </p>
        </Rise>
      </div>
      <div className="nm-wrap">
        <Rise>
          <dl className="nm-facts">
            <div>
              <dt>2001</dt>
              <dd>Registered</dd>
            </div>
            <div>
              <dt>20+ years</dt>
              <dd>In business</dd>
            </div>
            <div>
              <dt>Ontario, Canada</dt>
              <dd>B2B and B2C clients</dd>
            </div>
          </dl>
        </Rise>
      </div>
    </section>
  );
}

export function Why() {
  return (
    <section className="nm-section" id="why">
      <div className="nm-wrap">
        <Rise>
          <h2 className="nm-h2">Four protocols behind every project.</h2>
        </Rise>
        <ul className="nm-ledger">
          {protocols.map(([name, text], i) => (
            <Rise as="li" delay={i * 70} key={name}>
              <h3>{name}</h3>
              <p>{text}</p>
            </Rise>
          ))}
        </ul>
        <Rise>
          <ul className="nm-also">
            {also.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Rise>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="nm-section nm-section--deep" id="process">
      <div className="nm-wrap">
        <Rise>
          <h2 className="nm-h2">A method built to deliver the result.</h2>
        </Rise>
        <Rise className="nm-rail">
          {steps.map(([name, text]) => (
            <div className="nm-step" key={name}>
              <h3>{name}</h3>
              <p>{text}</p>
            </div>
          ))}
        </Rise>
      </div>
    </section>
  );
}

export function Clients() {
  const [index, setIndex] = useState(0);
  const current = clients[index];

  return (
    <section className="nm-section" id="clients">
      <div className="nm-wrap">
        <Rise>
          <p className="nm-label">Testimonials</p>
          <h2 className="nm-h2">What our clients say.</h2>
        </Rise>
        <div className="nm-clients__grid">
          <figure className="nm-quote" key={current.name}>
            <blockquote>&ldquo;{current.quote}&rdquo;</blockquote>
            <figcaption>
              <b>{current.name}</b>, {current.role}
            </figcaption>
          </figure>
          <ul className="nm-names">
            {clients.map((c, i) => (
              <li key={c.name}>
                <button aria-pressed={index === i} onClick={() => setIndex(i)} type="button">
                  <span>{c.name}</span>
                  <small>{c.role}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  return (
    <section className="nm-section nm-section--deep" id="contact">
      <div className="nm-wrap">
        <Rise className="nm-contact__panel">
          <div>
            <h2 className="nm-contact__title">
              Create a new project <span>with us.</span>
            </h2>
            <a className="nm-pill" href={`mailto:${EMAIL}`}>
              Let&rsquo;s Talk
              <i>
                <Arrow size={20} />
              </i>
            </a>
          </div>
          <dl className="nm-contact__list">
            <div>
              <dt>Phone</dt>
              <dd>
                <a href="tel:+12896901777">{PHONE}</a>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </dd>
            </div>
            <div>
              <dt>Studio</dt>
              <dd>
                {ADDRESS}
                <br />
                By appointment only
              </dd>
            </div>
          </dl>
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
                <a href="https://nextminds.com/digital-agency/">Digital Agency</a>
              </li>
              <li>
                <a href="https://nextminds.com/real-estate-media/">Real Estate Services</a>
              </li>
              <li>
                <a href="https://nextminds.com/ai-agents-development/">AI Development Services</a>
              </li>
              <li>
                <a href="https://nextminds.com/media-production/">Media Production</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>B2C services</h4>
            <ul>
              <li>Online Education</li>
              <li>Photo and Video Portraiture</li>
              <li>E-Learning Platforms</li>
              <li>E-Commerce Services</li>
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
