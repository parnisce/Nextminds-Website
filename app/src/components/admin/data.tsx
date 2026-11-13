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
      const { data: isAdmin, error } = await sb.rpc("is_admin");
      if (!alive) return;
      if (error) console.error("is_admin check failed:", error.message);
      setState(isAdmin === true ? { status: "in", email } : { status: "denied", email });
    };

    void resolve();
    // Supabase holds an internal lock while this callback runs, so calling getSession()/rpc()
    // inside it deadlocks (sign-in appears to hang). Defer the work to the next tick.
    let timer: ReturnType<typeof setTimeout> | undefined;
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        clearTimeout(timer);
        timer = setTimeout(() => void resolve(), 0);
      }
    });
    return () => {
      alive = false;
      clearTimeout(timer);
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

export type TaskStatus = "open" | "in_progress" | "blocked" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  tag: string;
  checklist: { text: string; done: boolean }[];
  time_seconds: number;
  estimate_minutes?: number;
  timer_started_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskInput = Partial<Omit<Task, "id" | "created_at" | "updated_at">> & { title: string };

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
  tasks: Task[];
  tasksReady: boolean;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setEnquiryStatus: (id: string, status: EnquiryStatus) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  savePost: (input: PostInput) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
  createTask: (input: TaskInput) => Promise<void>;
  updateTask: (id: string, patch: Partial<TaskInput>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
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
function demoData(): { enquiries: Enquiry[]; posts: Post[]; tasks: Task[] } {
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
  const day = 86400000;
  const iso = (offset: number) => new Date(Date.now() + offset * day).toISOString().slice(0, 10);
  const mk = (i: number, t: Partial<Task> & { title: string }): Task => ({
    id: `task-${i}`, description: "", status: "open", priority: "medium", due_date: null, tag: "website", checklist: [], time_seconds: 0,
    timer_started_at: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...t,
  });
  const tasks = [
    mk(0, { title: "Change the testimonial content", priority: "high", due_date: iso(-14) }),
    mk(1, { title: "Create separate page for portfolio", description: "Showcase our work with a filter by service.", due_date: iso(-6) }),
    mk(2, { title: "Write launch announcement post", status: "in_progress", priority: "high", due_date: iso(3), tag: "content", time_seconds: 2400, estimate_minutes: 90, checklist: [{ text: "Outline", done: true }, { text: "Draft", done: false }, { text: "Add cover image", done: false }] }),
    mk(3, { title: "Deploy the site", status: "done", priority: "high", estimate_minutes: 60, time_seconds: 3000, description: "Pick a host, run the production build and point the domain at it.", checklist: [{ text: "Build", done: true }, { text: "DNS", done: true }] }),
    mk(4, { title: "Build the contact form", status: "done", priority: "high", time_seconds: 5700 }),
  ];
  return { enquiries, posts, tasks };
}

export function AdminDataProvider({ email, demo, children }: { email: string; demo?: boolean; children: ReactNode }) {
  const seed = demo ? demoData() : null;
  const [enquiries, setEnquiries] = useState<Enquiry[]>(seed?.enquiries ?? []);
  const [posts, setPosts] = useState<Post[]>(seed?.posts ?? []);
  const [tasks, setTasks] = useState<Task[]>(seed?.tasks ?? []);
  const [tasksReady, setTasksReady] = useState(Boolean(demo));
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (demo) return;
    const sb = supabase();
    setLoading(true);
    const [enq, pst, tsk] = await Promise.all([
      sb.from("enquiries").select("*").order("created_at", { ascending: false }).limit(2000),
      sb.from("posts").select(POST_COLUMNS).order("created_at", { ascending: false }),
      sb.from("tasks").select("*").order("created_at", { ascending: true }),
    ]);
    // Tasks live in their own table (supabase/tasks.sql); a missing table only affects the Tasks page.
    setTasksReady(!tsk.error);
    setTasks((tsk.data as Task[] | null) ?? []);
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
      tasks,
      tasksReady,
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
      async createTask(input) {
        if (demo) {
          const now = new Date().toISOString();
          setTasks((l) => [...l, { id: `t-${Date.now()}`, description: "", status: "open", priority: "medium", due_date: null, tag: "", checklist: [], time_seconds: 0, timer_started_at: null, created_at: now, updated_at: now, ...input }]);
          return;
        }
        const { data, error: e } = await supabase().from("tasks").insert(input).select("*").single();
        if (e) throw new Error(e.message);
        setTasks((l) => [...l, data as Task]);
      },
      async updateTask(id, patch) {
        // Optimistic: the board moves instantly, then rolls back if the save fails.
        const before = tasks;
        setTasks((l) => l.map((t) => (t.id === id ? { ...t, ...patch } : t)));
        if (demo) return;
        const { error: e } = await supabase().from("tasks").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
        if (e) {
          setTasks(before);
          throw new Error(e.message);
        }
      },
      async deleteTask(id) {
        if (!demo) {
          const { error: e } = await supabase().from("tasks").delete().eq("id", id);
          if (e) throw new Error(e.message);
        }
        setTasks((l) => l.filter((t) => t.id !== id));
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
    [email, enquiries, posts, tasks, tasksReady, demo, loading, error, reload],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
