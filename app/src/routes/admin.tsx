import { createFileRoute } from "@tanstack/react-router";

import { AdminLayout } from "@/components/admin/shell";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin | NextMinds" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminLayout,
});
