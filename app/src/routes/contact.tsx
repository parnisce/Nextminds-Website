import { createFileRoute } from "@tanstack/react-router";

import { ContactPage } from "@/components/nextminds/pages";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | NextMinds" },
      {
        name: "description",
        content: "Tell NextMinds about your project. We reply within one business day.",
      },
    ],
  }),
  component: ContactPage,
});
