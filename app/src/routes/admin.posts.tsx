import { createFileRoute } from "@tanstack/react-router";

import { PostsPage } from "@/components/admin/posts";

export const Route = createFileRoute("/admin/posts")({
  validateSearch: (s: Record<string, unknown>): { id?: string; new?: boolean } => ({
    id: typeof s.id === "string" ? s.id : undefined,
    new: s.new === true || s.new === "true" ? true : undefined,
  }),
  component: PostsRoute,
});

function PostsRoute() {
  const { id, new: isNew } = Route.useSearch();
  return <PostsPage id={id} isNew={isNew} />;
}
