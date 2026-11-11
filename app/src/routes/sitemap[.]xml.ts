import { createFileRoute } from "@tanstack/react-router";

import { SITE_URL, serviceSlugs } from "../lib/seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = SITE_URL;
        const today = new Date().toISOString().split("T")[0];
        const paths = ["/", "/contact", ...serviceSlugs.map((slug) => `/services/${slug}`)];
        const urls = paths.flatMap((path) => [
          "  <url>",
          `    <loc>${origin}${path}</loc>`,
          `    <lastmod>${today}</lastmod>`,
          "    <changefreq>weekly</changefreq>",
          `    <priority>${path === "/" ? "1.0" : "0.8"}</priority>`,
          "  </url>",
        ]);
        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
