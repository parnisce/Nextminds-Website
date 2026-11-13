import { Browser, FilmSlate, HouseLine, Robot } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

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
import { HomeContentContext, fetchHome } from "@/lib/content";
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
  loader: () => fetchHome(),
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

const heroActions = <HeroActions />;

function Index() {
  const home = Route.useLoaderData();
  // Rebuilt only when the saved hero copy changes, so the scrub controller keeps a stable scenes array.
  const scenes = useMemo(
    () =>
      scrollScrubScenes.map((scene, i) => ({
        ...scene,
        kicker: home.hero[i]?.kicker ?? scene.kicker,
        title: home.hero[i]?.title ?? scene.title,
        body: home.hero[i]?.body ?? scene.body,
        actions: heroActions,
        icon: sceneIcons[scene.id],
      })),
    [home.hero],
  );
  return (
    <HomeContentContext.Provider value={home}>
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
    </HomeContentContext.Provider>
  );
}
