import { createFileRoute, notFound } from "@tanstack/react-router";

import { ServicePage } from "@/components/nextminds/pages";
import { services } from "@/components/nextminds/site";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    const service = services.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return { name: service.name, lead: service.lead };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Services"} | NextMinds` },
      { name: "description", content: loaderData?.lead ?? "NextMinds services." },
    ],
  }),
  component: ServiceRoute,
});

function ServiceRoute() {
  const { slug } = Route.useParams();
  return <ServicePage slug={slug} />;
}
