import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { type Post, formatDate } from "@/lib/content";
import { abs, breadcrumbs, organization, pageHead } from "@/lib/seo";

import { PageShell } from "./pages";
import { Arrow } from "./site";

export const blogIndexHead = () =>
  pageHead({
    title: "Blog | NextMinds",
    description: "Ideas, guides and updates from NextMinds on AI agents, web design, real estate media and video production.",
    path: "/blog",
    jsonLd: [organization, breadcrumbs([{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }])],
  });

export const blogPostHead = (post: Post | undefined) => {
  if (!post) return { meta: [{ title: "Post not found | NextMinds" }, { name: "robots", content: "noindex" }] };
  const path = `/blog/${post.slug}`;
  const description = post.excerpt || post.content.replace(/\s+/g, " ").slice(0, 155);
  return pageHead({
    title: `${post.title} | NextMinds`,
    description,
    path,
    image: post.cover_url ?? undefined,
    imageAlt: post.title,
    jsonLd: [
      organization,
      {
        "@type": "BlogPosting",
        headline: post.title,
        description,
        image: post.cover_url ? [abs(post.cover_url)] : undefined,
        datePublished: post.published_at ?? post.created_at,
        dateModified: post.updated_at,
        mainEntityOfPage: abs(path),
        author: { "@id": organization["@id"] },
        publisher: { "@id": organization["@id"] },
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title, path },
      ]),
    ],
  });
};

/** Renders the plain-text post body: "# " / "## " headings, "- " lists, blank-line paragraphs. */
export function PostBody({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const out: ReactNode[] = [];
  blocks.forEach((block, i) => {
    const b = block.trim();
    if (!b) return;
    if (b.startsWith("## ")) out.push(<h2 key={i}>{b.slice(3)}</h2>);
    else if (b.startsWith("# ")) out.push(<h2 key={i}>{b.slice(2)}</h2>);
    else if (b.startsWith("### ")) out.push(<h3 key={i}>{b.slice(4)}</h3>);
    else if (b.split("\n").every((l) => l.trim().startsWith("- ")))
      out.push(
        <ul key={i}>
          {b.split("\n").map((l, j) => (
            <li key={j}>{l.trim().slice(2)}</li>
          ))}
        </ul>,
      );
    else out.push(<p key={i}>{b}</p>);
  });
  return <div className="nm-prose">{out}</div>;
}

export function BlogIndex({ posts }: { posts: Post[] }) {
  return (
    <PageShell>
      <section className="nm-sp-hero nm-sp-hero--contact">
        <div aria-hidden="true" className="nm-sp-hero__glow" />
        <div className="nm-wrap">
          <nav aria-label="Breadcrumb" className="nm-crumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <b>Blog</b>
          </nav>
          <p className="nm-label">The NextMinds Blog</p>
          <h1 className="nm-sp-hero__title">
            Ideas for <span className="nm-accent">what&rsquo;s next.</span>
          </h1>
          <p className="nm-sp-hero__lead">Guides, news and lessons from our work in AI, web, real estate media and video.</p>
        </div>
      </section>

      <section className="nm-section nm-section--deep">
        <div className="nm-wrap">
          {posts.length === 0 ? (
            <p className="nm-body">No posts yet. Check back soon.</p>
          ) : (
            <div className="nm-blog__grid">
              {posts.map((post) => (
                <Link className="nm-blogcard" key={post.id} params={{ slug: post.slug }} to="/blog/$slug">
                  <span className="nm-blogcard__img">
                    {post.cover_url ? <img alt="" height={600} loading="lazy" src={post.cover_url} width={900} /> : <i aria-hidden="true" />}
                  </span>
                  <span className="nm-blogcard__body">
                    <small>{formatDate(post.published_at)}</small>
                    <b>{post.title}</b>
                    <span>{post.excerpt}</span>
                    <em>
                      Read article <Arrow size={14} />
                    </em>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}

export function BlogPostPage({ post }: { post: Post | null }) {
  if (!post) {
    return (
      <PageShell>
        <section className="nm-sp-hero">
          <div className="nm-wrap">
            <p className="nm-label">404</p>
            <h1 className="nm-sp-hero__title">Post not found.</h1>
            <p className="nm-sp-hero__lead">That article may have been moved or unpublished.</p>
            <Link className="nm-work__btn nm-work__btn--solid" to="/blog">
              Back to the blog <Arrow size={16} />
            </Link>
          </div>
        </section>
      </PageShell>
    );
  }
  return (
    <PageShell>
      <section className="nm-sp-hero nm-sp-hero--contact">
        <div aria-hidden="true" className="nm-sp-hero__glow" />
        <div className="nm-wrap nm-post__head">
          <nav aria-label="Breadcrumb" className="nm-crumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/blog">Blog</Link>
            <span>/</span>
            <b>{post.title}</b>
          </nav>
          <p className="nm-label">{formatDate(post.published_at)}</p>
          <h1 className="nm-sp-hero__title">{post.title}</h1>
          {post.excerpt ? <p className="nm-sp-hero__lead">{post.excerpt}</p> : null}
        </div>
      </section>
      <section className="nm-section nm-section--deep">
        <article className="nm-wrap nm-post">
          {post.cover_url ? <img alt={post.title} className="nm-post__cover" fetchPriority="high" height={675} src={post.cover_url} width={1200} /> : null}
          <PostBody text={post.content} />
          <Link className="nm-work__btn nm-work__btn--ghost" to="/blog">
            &larr; All articles
          </Link>
        </article>
      </section>
    </PageShell>
  );
}
