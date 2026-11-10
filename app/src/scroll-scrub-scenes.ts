/**
 * Scene data for the NextMinds scroll-scrub journey.
 * Single-shot: ONE continuous film, scrubbed end to end by the visitor's scroll.
 * Keep this array a module constant.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";

/** Brand tokens from design-brief.md (client brand colors). */
export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#00A1D6",
  background: "#132C3C",
  ink: "#EAF4F8",
  muted: "#9DB6C4",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    body: "We build AI agents around your workflows. Then we put that intelligence to work across everything below.",
    clip: "/assets/world/scene-01.mp4",
    id: "scene-01",
    jumpAt: 0.08,
    align: "left",
    kicker: "AI Development Services",
    label: "AI Development",
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.png",
    poster: "/assets/world/scene-01-poster.png",
    scroll: 4,
    title: "AI agents that work for your business.",
  },
  {
    body: "AI plans, designs and builds fast, modern websites that turn visitors into customers and grow with your business.",
    clip: "/assets/world/scene-02.mp4",
    id: "scene-02",
    jumpAt: 0.5,
    align: "right",
    kicker: "Web Digital Agency",
    label: "Web Digital",
    mobileClip: "/assets/world/scene-02-mobile.mp4",
    mobilePoster: "/assets/world/scene-02-mobile-poster.png",
    poster: "/assets/world/scene-02-poster.png",
    scroll: 3,
    title: "Websites built to convert.",
  },
  {
    body: "AI sorts photos, writes listings and powers tours that make every property stand out and sell faster.",
    clip: "/assets/world/scene-03.mp4",
    id: "scene-03",
    jumpAt: 0.62,
    align: "left",
    kicker: "Real Estate Services",
    label: "Real Estate",
    mobileClip: "/assets/world/scene-03-mobile.mp4",
    mobilePoster: "/assets/world/scene-03-mobile-poster.png",
    poster: "/assets/world/scene-03-poster.png",
    scroll: 3.4,
    title: "Listings that sell faster.",
  },
  {
    body: "AI speeds up scripting, editing and delivery of high-quality video and content, from first concept to final cut.",
    clip: "/assets/world/scene-04.mp4",
    id: "scene-04",
    jumpAt: 0.62,
    align: "right",
    kicker: "Media Production",
    label: "Media",
    mobileClip: "/assets/world/scene-04-mobile.mp4",
    mobilePoster: "/assets/world/scene-04-mobile-poster.png",
    poster: "/assets/world/scene-04-poster.png",
    scroll: 3,
    title: "Stories worth watching.",
  },
];
