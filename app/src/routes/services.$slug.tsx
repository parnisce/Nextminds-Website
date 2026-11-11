import { createFileRoute, notFound } from "@tanstack/react-router";

import { ServicePage, serviceHead } from "@/components/nextminds/pages";
import { allServices } from "@/components/nextminds/site";

export const Route = createFileRoute("/services/$slug")({
  loader: ({ params }) => {
    if (!allServices.some((s) => s.slug === params.slug)) throw notFound();
    return { slug: params.slug };
  },
  head: ({ params }) => serviceHead(params.slug),
  component: ServiceRoute,
});

function ServiceRoute() {
  const { slug } = Route.useParams();
  return <ServicePage slug={slug} />;
}
