import { createFileRoute } from "@tanstack/react-router";

import { InsightsPage } from "@/components/admin/insights";

export const Route = createFileRoute("/admin/insights")({ component: InsightsPage });
