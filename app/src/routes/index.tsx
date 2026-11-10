import { Browser, FilmSlate, HouseLine, Robot } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";

import {
  About,
  Clients,
  Contact,
  Footer,
  HeroActions,
  Nav,
  Process,
  Services,
  Why,
} from "@/components/nextminds/site";
import { SmoothScroll } from "@/components/nextminds/smooth-scroll";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

export const Route = createFileRoute("/")({
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
        <Process />
        <Clients />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
