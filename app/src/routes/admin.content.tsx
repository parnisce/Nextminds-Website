import { createFileRoute } from "@tanstack/react-router";

import { ContentEditor } from "@/components/admin/content-editor";

export const Route = createFileRoute("/admin/content")({ component: ContentEditor });
