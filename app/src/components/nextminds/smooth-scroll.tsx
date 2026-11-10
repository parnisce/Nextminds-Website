import Lenis from "lenis";
import { useEffect } from "react";

declare global {
  interface Window {
    __nmLenis?: Lenis;
  }
}

/** Inertial, continuous page scrolling. Also glides anchor links to their section. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, smoothWheel: true });
    window.__nmLenis = lenis;

    let raf = requestAnimationFrame(function tick(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    });

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const hash = link.getAttribute("href") ?? "";
      const target = hash.length > 1 ? document.querySelector<HTMLElement>(hash) : null;
      if (hash === "#" || target) {
        event.preventDefault();
        lenis.scrollTo(target ?? 0, { duration: 1.6 });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      delete window.__nmLenis;
    };
  }, []);

  return null;
}
