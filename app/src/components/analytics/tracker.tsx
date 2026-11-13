import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { supabase } from "@/lib/supabase";

// Privacy-friendly analytics: no cookies, no IP addresses. A random id lives in
// sessionStorage for the length of one browsing session so visits can be counted.

export const NO_TRACK_KEY = "nma-notrack";

type Kind = "view" | "action" | "message";

function blocked(path: string): boolean {
  if (path.startsWith("/admin") || path.startsWith("/login")) return true;
  try {
    if (localStorage.getItem(NO_TRACK_KEY) === "1") return true;
  } catch {
    /* storage unavailable */
  }
  if (navigator.doNotTrack === "1" || navigator.webdriver) return true;
  return /bot|crawl|spider|headless|preview/i.test(navigator.userAgent);
}

function sessionId(): string {
  try {
    let id = sessionStorage.getItem("nma-sid");
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, "").slice(0, 20);
      sessionStorage.setItem("nma-sid", id);
    }
    return id;
  } catch {
    return `anon${Math.random().toString(36).slice(2, 12)}`;
  }
}

const device = () => (window.innerWidth < 768 ? "mobile" : window.innerWidth < 1100 ? "tablet" : "desktop");

function send(kind: Kind, path: string, label?: string, extra: Record<string, string | null> = {}) {
  if (blocked(path)) return;
  void supabase()
    .from("page_views")
    .insert({ session_id: sessionId(), kind, path: path.slice(0, 300), label: label?.slice(0, 200) ?? null, device: device(), ...extra })
    .then(
      () => undefined,
      () => undefined,
    );
}

/** Record a custom event, e.g. a contact message. Safe to call anywhere in the browser. */
export function trackEvent(kind: "action" | "message", label: string) {
  send(kind, window.location.pathname, label);
}

/** Mount once near the app root. Records page views and outbound/phone/email clicks. */
export function Tracker() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const last = useRef("");

  useEffect(() => {
    const stamp = `${path}|${Math.floor(Date.now() / 1500)}`;
    if (last.current === stamp) return; // dev double-effect guard
    last.current = stamp;

    let ref: string | null = null;
    try {
      if (document.referrer) {
        const host = new URL(document.referrer).hostname;
        if (host && host !== window.location.hostname) ref = host.replace(/^www\./, "");
      }
    } catch {
      /* bad referrer */
    }
    const first = (() => {
      try {
        if (sessionStorage.getItem("nma-first")) return false;
        sessionStorage.setItem("nma-first", "1");
        return true;
      } catch {
        return false;
      }
    })();
    const q = new URLSearchParams(window.location.search);
    send("view", path, undefined, {
      referrer: first ? ref : null,
      utm_source: first ? q.get("utm_source") : null,
      utm_medium: first ? q.get("utm_medium") : null,
      utm_campaign: first ? q.get("utm_campaign") : null,
    });
  }, [path]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href");
      if (!a || !href) return;
      if (href.startsWith("tel:")) return trackEvent("action", "Phone number tapped");
      if (href.startsWith("mailto:")) return trackEvent("action", "Email link clicked");
      try {
        const url = new URL(href, window.location.href);
        if (/^https?:$/.test(url.protocol) && url.hostname !== window.location.hostname) {
          trackEvent("action", `Outside link clicked · ${url.hostname.replace(/^www\./, "")}`);
        }
      } catch {
        /* not a URL */
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
