import { Browser, FilmSlate, HouseLine, Robot } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";

import {
  About,
  Clients,
  Contact,
  Faq,
  Footer,
  HeroActions,
  Nav,
  Services,
  Why,
} from "@/components/nextminds/site";
import { SITE_URL, organization, pageHead } from "@/lib/seo";
import { SmoothScroll } from "@/components/nextminds/smooth-scroll";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

export const Route = createFileRoute("/")({
  head: () =>
    pageHead({
      title: "NextMinds | AI Agents, Web Design, Real Estate Media & Video",
      description:
        "NextMinds Business Solutions in Ontario, Canada: AI agent development, web design, real estate media and video production from one team.",
      path: "/",
      jsonLd: [
        organization,
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: "NextMinds",
          publisher: { "@id": `${SITE_URL}/#organization` },
        },
      ],
    }),
  component: Index,
});

// The hero chapter carries the site's own calls to action. Kept at module scope
// so the scenes array identity never changes between renders.
const sceneIcons: Record<string, React.ReactNode> = {
  "scene-01": <Robot aria-hidden size={14} weight="duotone" />,
  "scene-02": <Browser aria-hidden size={14} weight="duotone" />,
  "scene-03": <HouseLine aria-hidden size={14} weight="duotone" />,
  "scene-04": <FilmSlate aria-hidden size={14} weight="duotone" />,
};

const scenes = scrollScrubScenes.map((scene) => ({
  ...scene,
  actions: <HeroActions />,
  icon: sceneIcons[scene.id],
}));

function Index() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main>
        <ScrollScrub scenes={scenes} theme={scrollScrubTheme} />
        <Services />
        <About />
        <Why />
        <Clients />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
