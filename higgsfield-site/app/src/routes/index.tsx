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
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

export const Route = createFileRoute("/")({
  component: Index,
});

// The hero chapter carries the site's own calls to action. Kept at module scope
// so the scenes array identity never changes between renders.
const scenes = scrollScrubScenes.map((scene) => ({ ...scene, actions: <HeroActions /> }));

function Index() {
  return (
    <>
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
