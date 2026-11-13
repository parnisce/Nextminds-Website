import { createFileRoute } from "@tanstack/react-router";

import { LoginPage } from "@/components/admin/login";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Admin sign in | NextMinds" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: LoginPage,
});
