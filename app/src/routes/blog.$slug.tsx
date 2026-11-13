import { createFileRoute } from "@tanstack/react-router";

import { BlogPostPage, blogPostHead } from "@/components/nextminds/blog";
import { fetchPost } from "@/lib/content";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => fetchPost(params.slug),
  head: ({ loaderData }) => blogPostHead(loaderData ?? undefined),
  component: BlogPostRoute,
});

function BlogPostRoute() {
  return <BlogPostPage post={Route.useLoaderData()} />;
}
