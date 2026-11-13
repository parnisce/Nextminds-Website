import { createContext, useContext } from "react";

import { scrollScrubScenes } from "@/scroll-scrub-scenes";

import { supabasePublic } from "./supabase";

// Everything on the homepage that the admin can edit. Defaults live here so the
// site renders identically before the database is connected or if it is down.
export type HomeContent = {
  hero: { kicker: string; title: string; body: string }[];
  about: {
    intro: string[];
    stats: { value: string; label: string }[];
    values: { title: string; text: string }[];
  };
  faqs: { q: string; a: string }[];
  testimonials: { quote: string; name: string; role: string }[];
  cta: { badge: string; title: string; accent: string; lede: string };
};

export const defaultHome: HomeContent = {
  hero: scrollScrubScenes.map((s) => ({ kicker: s.kicker ?? "", title: s.title, body: s.body })),
  about: {
    intro: [
      "NextMinds is a team of builders, designers and storytellers. We combine AI, web, real estate media and video production under one roof, so your ideas turn into real results without juggling five different vendors.",
      "Registered in 2001, with over 20 years in business, we have the knowledge, experience and expertise to elevate your brand’s online image and provide a unique digital experience.",
    ],
    stats: [
      { value: "50+", label: "Projects\nDelivered" },
      { value: "4", label: "Core\nDisciplines" },
      { value: "24/7", label: "AI Agents\nRunning" },
      { value: "100%", label: "Client\nFocused" },
    ],
    values: [
      {
        title: "Innovation",
        text: "We prioritize collaboration and innovation to drive success. By fostering effective communication and encouraging teamwork, we empower our clients to harness the collective expertise of their teams and unlock new possibilities.",
      },
      {
        title: "Project Management",
        text: "We understand the importance of effective project management in achieving desired outcomes. Our team is equipped with the skills and tools to meticulously plan and execute projects, keeping a keen eye on deadlines, milestones, and resource allocation.",
      },
      {
        title: "Quality Assurance",
        text: "Quality is at the core of everything we do. Our relentless commitment to delivering excellence drives our quality assurance protocols. We have implemented robust processes to ensure that our services meet the highest industry standards.",
      },
      {
        title: "Security",
        text: "In an increasingly digital world, cybersecurity is of utmost importance. We take the security of your business seriously and employ advanced security measures to safeguard your sensitive data and digital assets.",
      },
    ],
  },
  faqs: [
    { q: "What services does NextMinds offer?", a: "AI agent development, web design and development, real estate media, and video production." },
    { q: "How long does a typical project take?", a: "Most projects take a few weeks depending on scope. We agree on milestones up front." },
    { q: "Do you work with small businesses?", a: "Yes, we work with businesses of all sizes, from startups to established companies." },
    { q: "How does pricing work?", a: "We scope each project and quote a clear fixed price or a monthly plan." },
    { q: "Can you integrate AI into our existing tools?", a: "Yes, we connect agents to CRMs, calendars, help desks and your own APIs." },
    { q: "What happens after launch?", a: "We offer support and improvement plans so your project keeps performing." },
  ],
  testimonials: [
    { quote: "The team was professional, responsive and most importantly, delivered results.", name: "Ryan B. Moore", role: "Financial Advisor" },
    { quote: "From design to development, their team was able to take my vision and turn it into a reality.", name: "Ruth Cole", role: "Real Estate Agent" },
    { quote: "They helped me create a social media strategy that's been driving real results for my business.", name: "Leila Burke", role: "Clinic Manager" },
    { quote: "Their attention to detail and professionalism were top-notch, and the final product exceeded our expectations.", name: "Glenn Nelson", role: "Gym Owner" },
    { quote: "Their team was very patient and always willing to make changes and tweaks until we were completely satisfied.", name: "Brad Wright", role: "Real Estate Agent" },
  ],
  cta: {
    badge: "Now booking new projects",
    title: "Create a new project",
    accent: "with us.",
    lede: "Tell us what you’re building. We’ll get back to you within one business day with ideas, a plan and a clear next step.",
  },
};

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);

function list<T>(value: unknown, fallback: T[], pick: (item: Record<string, unknown>, i: number) => T): T[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter(isObj).map((item, i) => pick(item, i));
  return items.length ? items : fallback;
}

/** Overlays saved content on the defaults, ignoring anything malformed. */
export function mergeHome(saved: unknown): HomeContent {
  if (!isObj(saved)) return defaultHome;
  const d = defaultHome;
  const about = isObj(saved.about) ? saved.about : {};
  const cta = isObj(saved.cta) ? saved.cta : {};
  return {
    hero: d.hero.map((base, i) => {
      const s = Array.isArray(saved.hero) && isObj(saved.hero[i]) ? saved.hero[i] : {};
      return { kicker: str(s.kicker, base.kicker), title: str(s.title, base.title), body: str(s.body, base.body) };
    }),
    about: {
      intro: Array.isArray(about.intro) && about.intro.length ? about.intro.map((p) => str(p, "")) : d.about.intro,
      stats: d.about.stats.map((base, i) => {
        const s = Array.isArray(about.stats) && isObj(about.stats[i]) ? about.stats[i] : {};
        return { value: str(s.value, base.value), label: str(s.label, base.label) };
      }),
      values: d.about.values.map((base, i) => {
        const s = Array.isArray(about.values) && isObj(about.values[i]) ? about.values[i] : {};
        return { title: str(s.title, base.title), text: str(s.text, base.text) };
      }),
    },
    faqs: list(saved.faqs, d.faqs, (s) => ({ q: str(s.q, ""), a: str(s.a, "") })),
    testimonials: list(saved.testimonials, d.testimonials, (s) => ({
      quote: str(s.quote, ""),
      name: str(s.name, ""),
      role: str(s.role, ""),
    })),
    cta: { badge: str(cta.badge, d.cta.badge), title: str(cta.title, d.cta.title), accent: str(cta.accent, d.cta.accent), lede: str(cta.lede, d.cta.lede) },
  };
}

/** Server/loader read of the saved homepage content. Never throws. */
export async function fetchHome(): Promise<HomeContent> {
  try {
    const { data } = await supabasePublic().from("site_content").select("value").eq("key", "home").maybeSingle();
    return mergeHome(data?.value);
  } catch {
    return defaultHome;
  }
}

export const HomeContentContext = createContext<HomeContent>(defaultHome);
export const useHome = () => useContext(HomeContentContext);

// Blog -----------------------------------------------------------------------
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export const POST_COLUMNS = "id,slug,title,excerpt,content,cover_url,status,published_at,created_at,updated_at";

export async function fetchPosts(): Promise<Post[]> {
  try {
    const { data } = await supabasePublic()
      .from("posts")
      .select(POST_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false });
    return (data as Post[] | null) ?? [];
  } catch {
    return [];
  }
}

export async function fetchPost(slug: string): Promise<Post | null> {
  try {
    const { data } = await supabasePublic().from("posts").select(POST_COLUMNS).eq("slug", slug).eq("status", "published").maybeSingle();
    return (data as Post | null) ?? null;
  } catch {
    return null;
  }
}

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

export const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" }) : "";
