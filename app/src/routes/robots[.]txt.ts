import { createFileRoute } from "@tanstack/react-router";

import { SITE_URL } from "../lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const origin = SITE_URL;
        const body = ["User-agent: *", "Allow: /", "Disallow: /admin", "Disallow: /login", "", `Sitemap: ${origin}/sitemap.xml`].join("\n");
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
