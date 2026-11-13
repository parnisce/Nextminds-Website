import { createFileRoute } from "@tanstack/react-router";

import { BlogIndex, blogIndexHead } from "@/components/nextminds/blog";
import { fetchPosts } from "@/lib/content";

export const Route = createFileRoute("/blog")({
  loader: () => fetchPosts(),
  head: blogIndexHead,
  component: BlogRoute,
});

function BlogRoute() {
  return <BlogIndex posts={Route.useLoaderData()} />;
}
