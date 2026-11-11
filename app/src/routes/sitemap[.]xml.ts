import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const today = new Date().toISOString().split("T")[0];
        const paths = ["/", "/contact", "/services/digital-agency", "/services/real-estate-media", "/services/ai-agents-development", "/services/media-production"];
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
