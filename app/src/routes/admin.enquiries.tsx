import { createFileRoute } from "@tanstack/react-router";

import { EnquiriesPage } from "@/components/admin/enquiries";

export const Route = createFileRoute("/admin/enquiries")({
  validateSearch: (s: Record<string, unknown>): { id?: string } => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  component: EnquiriesRoute,
});

function EnquiriesRoute() {
  return <EnquiriesPage id={Route.useSearch().id} />;
}
