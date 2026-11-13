import { ArrowSquareOut, FloppyDisk, ImageSquare, MagnifyingGlass, Plus, Trash, UploadSimple } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { type Post, formatDate, slugify } from "@/lib/content";
import { supabase } from "@/lib/supabase";

import { type PostInput, useAdminData } from "./data";
import { Confirm, Field, PageHead, StatusPill, useToast } from "./ui";

const blank: PostInput = { slug: "", title: "", excerpt: "", content: "", cover_url: null, status: "draft" };

function Editor({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const { savePost, deletePost } = useAdminData();
  const toast = useToast();
  const [form, setForm] = useState<PostInput>(post ? { ...post } : blank);
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const patch = (p: Partial<PostInput>) => setForm((f) => ({ ...f, ...p }));

  const save = async (status: "draft" | "published") => {
    if (!form.title.trim()) return toast("Give the post a title first.", "err");
    const slug = slugify(form.slug || form.title);
    if (!slug) return toast("The URL slug is empty.", "err");
    setBusy(true);
    try {
      const saved = await savePost({ ...form, slug, status, published_at: post?.published_at ?? null });
      setForm({ ...saved });
      setSlugTouched(true);
      toast(status === "published" ? "Post published." : "Draft saved.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save the post.", "err");
    } finally {
      setBusy(false);
    }
  };

  const upload = async (f: File) => {
    if (!f.type.startsWith("image/")) return toast("Please choose an image file.", "err");
    if (f.size > 5 * 1024 * 1024) return toast("Images must be under 5 MB.", "err");
    setUploading(true);
    const ext = f.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase().storage.from("blog").upload(path, f, { cacheControl: "31536000", upsert: false });
    if (error) {
      toast(`Upload failed: ${error.message}`, "err");
    } else {
      patch({ cover_url: supabase().storage.from("blog").getPublicUrl(path).data.publicUrl });
      toast("Image uploaded.");
    }
    setUploading(false);
  };

  const remove = async () => {
    if (!form.id) return;
    try {
      await deletePost(form.id);
      toast("Post deleted.");
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not delete.", "err");
    }
  };

  const isLive = form.status === "published" && Boolean(form.id);

  return (
    <div className="ad-card ad-editor">
      <header className="ad-card__head">
        <div>
          <h2>{form.id ? "Edit post" : "New post"}</h2>
          <p>{form.id ? <StatusPill status={form.status} /> : "Write it, save a draft, publish when ready."}</p>
        </div>
        <button className="ad-btn ad-btn--ghost" onClick={onClose} type="button">
          Close
        </button>
      </header>

      <div className="ad-stack">
        <Field label="Title">
          <input
            onChange={(e) => patch({ title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })}
            placeholder="How AI agents save a small business 10 hours a week"
            value={form.title}
          />
        </Field>
        <Field hint={`Page address: /blog/${form.slug || "your-post"}`} label="URL slug">
          <input
            onChange={(e) => {
              setSlugTouched(true);
              patch({ slug: slugify(e.target.value) });
            }}
            value={form.slug}
          />
        </Field>
        <Field hint="Shown on the blog list and in Google results. Aim for 120 to 155 characters." label="Short summary">
          <textarea maxLength={300} onChange={(e) => patch({ excerpt: e.target.value })} rows={2} value={form.excerpt} />
        </Field>

        <div className="ad-field">
          <span>Cover image</span>
          <div className="ad-cover">
            <div className="ad-cover__preview">
              {form.cover_url ? <img alt="" src={form.cover_url} /> : <ImageSquare size={36} weight="duotone" />}
            </div>
            <div className="ad-cover__side">
              <input onChange={(e) => patch({ cover_url: e.target.value || null })} placeholder="Paste an image address, or upload one" value={form.cover_url ?? ""} />
              <div className="ad-row-actions">
                <input accept="image/*" hidden onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} ref={file} type="file" />
                <button className="ad-btn" disabled={uploading} onClick={() => file.current?.click()} type="button">
                  <UploadSimple size={16} /> {uploading ? "Uploading…" : "Upload image"}
                </button>
                {form.cover_url ? (
                  <button className="ad-btn ad-btn--ghost" onClick={() => patch({ cover_url: null })} type="button">
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <Field hint={"Blank line = new paragraph. Start a line with “## ” for a heading, or “- ” for bullet points."} label="Article">
          <textarea className="ad-article" onChange={(e) => patch({ content: e.target.value })} rows={16} value={form.content} />
        </Field>
      </div>

      <div className="ad-editor__foot">
        {form.id ? (
          <button className="ad-btn ad-btn--ghost ad-btn--red" onClick={() => setConfirm(true)} type="button">
            <Trash size={16} /> Delete
          </button>
        ) : (
          <span />
        )}
        <div className="ad-row-actions">
          {isLive ? (
            <a className="ad-btn" href={`/blog/${form.slug}`} rel="noreferrer" target="_blank">
              <ArrowSquareOut size={16} /> View
            </a>
          ) : null}
          {form.status === "published" ? (
            <button className="ad-btn" disabled={busy} onClick={() => void save("draft")} type="button">
              Unpublish
            </button>
          ) : (
            <button className="ad-btn" disabled={busy} onClick={() => void save("draft")} type="button">
              <FloppyDisk size={16} /> Save draft
            </button>
          )}
          <button className="ad-btn ad-btn--primary" disabled={busy} onClick={() => void save("published")} type="button">
            {form.status === "published" ? "Update post" : "Publish"}
          </button>
        </div>
      </div>

      <Confirm
        action="Delete post"
        onCancel={() => setConfirm(false)}
        onConfirm={() => void remove()}
        open={confirm}
        text="This permanently removes the post from your site and cannot be undone."
        title="Delete this post?"
      />
    </div>
  );
}

export function PostsPage({ id, isNew }: { id?: string; isNew?: boolean }) {
  const { posts, loading } = useAdminData();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const shown = useMemo(
    () =>
      posts.filter(
        (p) => (filter === "all" || p.status === filter) && (!q || `${p.title} ${p.excerpt}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [posts, q, filter],
  );

  const selected = id ? (posts.find((p) => p.id === id) ?? null) : null;
  const editing = isNew || selected;

  // Scroll the editor into view when it opens.
  useEffect(() => {
    if (editing) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [editing]);

  const close = () => void navigate({ to: "/admin/posts", search: {} });

  return (
    <>
      <PageHead
        actions={
          <button className="ad-btn ad-btn--primary" onClick={() => void navigate({ to: "/admin/posts", search: { new: true } })} type="button">
            <Plus size={18} weight="bold" /> New post
          </button>
        }
        sub="Write and publish articles for your blog."
        title="Blog posts"
      />

      {editing ? <Editor key={selected?.id ?? "new"} onClose={close} post={selected} /> : null}

      <div className="ad-card">
        <div className="ad-toolbar">
          <label className="ad-search">
            <MagnifyingGlass size={18} />
            <input onChange={(e) => setQ(e.target.value)} placeholder="Search posts" value={q} />
          </label>
          <div className="ad-chips">
            {(["all", "published", "draft"] as const).map((f) => (
              <button className={filter === f ? "is-active" : ""} key={f} onClick={() => setFilter(f)} type="button">
                {f === "all" ? "All" : f === "published" ? "Published" : "Drafts"}
                <b>{f === "all" ? posts.length : posts.filter((p) => p.status === f).length}</b>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="ad-empty">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="ad-empty">{posts.length === 0 ? "No posts yet. Click New post to write your first one." : "No posts match your search."}</p>
        ) : (
          <ul className="ad-posts">
            {shown.map((p) => (
              <li className={p.id === id ? "is-selected" : ""} key={p.id}>
                <button onClick={() => void navigate({ to: "/admin/posts", search: { id: p.id } })} type="button">
                  <span className="ad-posts__img">{p.cover_url ? <img alt="" loading="lazy" src={p.cover_url} /> : <ImageSquare size={22} weight="duotone" />}</span>
                  <span className="ad-list__main">
                    <b>{p.title}</b>
                    <small>{p.excerpt || "No summary"}</small>
                  </span>
                  <StatusPill status={p.status} />
                  <time>{formatDate(p.published_at ?? p.created_at)}</time>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
