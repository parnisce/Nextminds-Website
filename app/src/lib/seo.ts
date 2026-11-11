// Shared SEO helpers: one place for the site URL, per-page head tags and JSON-LD.

/** Canonical origin. Change this one line when the site moves to its own domain. */
export const SITE_URL = "https://nextminds-website.pages.dev";
export const SITE_NAME = "NextMinds";
export const DEFAULT_OG_IMAGE = "/assets/services/web.jpg";

export const serviceSlugs = [
  "digital-agency",
  "real-estate-media",
  "ai-agents-development",
  "media-production",
  "online-education",
  "photo-video-portraiture",
  "e-learning-platforms",
  "e-commerce-services",
] as const;

export const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

export const organization = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "NextMinds Business Solutions",
  url: SITE_URL,
  logo: abs("/assets/brand/logo.png"),
  email: "info@nextminds.com",
  telephone: "+1-289-690-1777",
  foundingDate: "2001",
  address: {
    "@type": "PostalAddress",
    streetAddress: "27 Bounty Avenue",
    addressLocality: "Thorold",
    addressRegion: "ON",
    postalCode: "L2V 0H3",
    addressCountry: "CA",
  },
};

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

type HeadInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  jsonLd?: Record<string, unknown>[];
};

/** Builds title, description, canonical, Open Graph, Twitter and JSON-LD tags for a page. */
export function pageHead({ title, description, path, image = DEFAULT_OG_IMAGE, imageAlt, jsonLd = [] }: HeadInput) {
  const url = abs(path);
  const img = abs(image);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_CA" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: img },
      { property: "og:image:alt", content: imageAlt ?? title },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: img },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: jsonLd.length
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({ "@context": "https://schema.org", "@graph": jsonLd }),
          },
        ]
      : [],
  };
}
