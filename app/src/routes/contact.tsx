import { createFileRoute } from "@tanstack/react-router";

import { ContactPage, contactHead } from "@/components/nextminds/pages";

export const Route = createFileRoute("/contact")({
  head: contactHead,
  component: ContactPage,
});
