import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { type HomeContent, type Post, POST_COLUMNS, mergeHome } from "@/lib/content";
import { supabase } from "@/lib/supabase";

// ── Auth ────────────────────────────────────────────────────────────────────
export type AuthState =
  | { status: "loading" }
  | { status: "out" }
  | { status: "denied"; email: string }
  | { status: "in"; email: string };

/** Tracks the Supabase session and whether that user is listed in public.admins. */
export function useAdminAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const sb = supabase();
    let alive = true;

    const resolve = async () => {
      const { data } = await sb.auth.getSession();
      const email = data.session?.user.email;
      if (!alive) return;
      if (!email) return setState({ status: "out" });
      const { data: isAdmin } = await sb.rpc("is_admin");
      if (!alive) return;
      setState(isAdmin === true ? { status: "in", email } : { status: "denied", email });
    };

    void resolve();
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void resolve();
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export const signOut = () => supabase().auth.signOut();

// ── Data ────────────────────────────────────────────────────────────────────
export type EnquiryStatus = "new" | "read" | "replied" | "archived";

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  status: EnquiryStatus;
  created_at: string;
};

export type PostInput = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  status: "draft" | "published";
  published_at?: string | null;
};

type AdminData = {
  email: string;
  enquiries: Enquiry[];
  posts: Post[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setEnquiryStatus: (id: string, status: EnquiryStatus) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  savePost: (input: PostInput) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
  loadHome: () => Promise<HomeContent>;
  saveHome: (content: HomeContent) => Promise<void>;
};

const Ctx = createContext<AdminData | null>(null);

export function useAdminData() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAdminData must be used inside <AdminDataProvider>");
  return value;
}

// Dev-only sample data so the dashboard can be previewed without a database (/admin?demo).
function demoData(): { enquiries: Enquiry[]; posts: Post[] } {
  const names = ["Ava Thompson", "Marcus Lee", "Priya Patel", "Jordan Blake", "Sofia Rossi", "Noah Campbell", "Mia Fortin", "Liam O’Neil", "Zoe Martin", "Ethan Park"];
  const services = ["AI Agents Development", "Digital Agency", "Real Estate Media", "E-Commerce Services", "Media Production", "Online Education"];
  const statuses: Enquiry["status"][] = ["new", "new", "read", "replied", "read", "new", "replied", "archived", "read", "new"];
  const enquiries = Array.from({ length: 28 }, (_, i) => ({
    id: `demo-${i}`,
    name: names[i % names.length]!,
    email: `${names[i % names.length]!.split(" ")[0]!.toLowerCase()}@example.com`,
    phone: i % 3 === 0 ? "(289) 555-0142" : null,
    service: services[(i * 7) % services.length]!,
    message: "Hi team, we would like to talk about a new project and get a quote. Could someone call us this week?",
    status: statuses[i % statuses.length]!,
    created_at: new Date(Date.now() - i * 86400000 * 0.9 - i * 3600000).toISOString(),
  }));
  const posts = ["How AI agents save small teams 10 hours a week", "Five website mistakes that cost you leads", "Why real estate video sells homes faster"].map((title, i) => ({
    id: `post-${i}`,
    slug: `demo-${i}`,
    title,
    excerpt: "A short summary of the article goes here.",
    content: "Body",
    cover_url: null,
    status: (i === 2 ? "draft" : "published") as Post["status"],
    published_at: i === 2 ? null : new Date(Date.now() - i * 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - i * 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }));
  return { enquiries, posts };
}

export function AdminDataProvider({ email, demo, children }: { email: string; demo?: boolean; children: ReactNode }) {
  const seed = demo ? demoData() : null;
  const [enquiries, setEnquiries] = useState<Enquiry[]>(seed?.enquiries ?? []);
  const [posts, setPosts] = useState<Post[]>(seed?.posts ?? []);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (demo) return;
    const sb = supabase();
    setLoading(true);
    const [enq, pst] = await Promise.all([
      sb.from("enquiries").select("*").order("created_at", { ascending: false }).limit(2000),
      sb.from("posts").select(POST_COLUMNS).order("created_at", { ascending: false }),
    ]);
    const failure = enq.error ?? pst.error;
    setError(
      failure
        ? failure.code === "42P01" || /schema cache|does not exist/i.test(failure.message)
          ? "The database tables are missing. Run app/supabase/schema.sql in the Supabase SQL Editor, then reload."
          : failure.message
        : null,
    );
    setEnquiries((enq.data as Enquiry[] | null) ?? []);
    setPosts((pst.data as Post[] | null) ?? []);
    setLoading(false);
  }, [demo]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<AdminData>(
    () => ({
      email,
      enquiries,
      posts,
      loading,
      error,
      reload,
      async setEnquiryStatus(id, status) {
        const { error: e } = await supabase().from("enquiries").update({ status }).eq("id", id);
        if (e) throw new Error(e.message);
        setEnquiries((list) => list.map((q) => (q.id === id ? { ...q, status } : q)));
      },
      async deleteEnquiry(id) {
        const { error: e } = await supabase().from("enquiries").delete().eq("id", id);
        if (e) throw new Error(e.message);
        setEnquiries((list) => list.filter((q) => q.id !== id));
      },
      async savePost(input) {
        const now = new Date().toISOString();
        const row = {
          slug: input.slug,
          title: input.title,
          excerpt: input.excerpt,
          content: input.content,
          cover_url: input.cover_url,
          status: input.status,
          published_at: input.status === "published" ? (input.published_at ?? now) : null,
          updated_at: now,
        };
        const q = input.id
          ? supabase().from("posts").update(row).eq("id", input.id)
          : supabase().from("posts").insert(row);
        const { data, error: e } = await q.select(POST_COLUMNS).single();
        if (e) throw new Error(e.code === "23505" ? "That URL slug is already used by another post." : e.message);
        const saved = data as Post;
        setPosts((list) => (input.id ? list.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...list]));
        return saved;
      },
      async deletePost(id) {
        const { error: e } = await supabase().from("posts").delete().eq("id", id);
        if (e) throw new Error(e.message);
        setPosts((list) => list.filter((p) => p.id !== id));
      },
      async loadHome() {
        const { data } = await supabase().from("site_content").select("value").eq("key", "home").maybeSingle();
        return mergeHome(data?.value);
      },
      async saveHome(content) {
        const { error: e } = await supabase()
          .from("site_content")
          .upsert({ key: "home", value: content, updated_at: new Date().toISOString() });
        if (e) throw new Error(e.message);
      },
    }),
    [email, enquiries, posts, loading, error, reload],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
