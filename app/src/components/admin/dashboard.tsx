import { Article, ArrowRight, EnvelopeSimple, EnvelopeSimpleOpen, Plus, PencilRuler, TrendUp } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatDate } from "@/lib/content";

import { useAdminData } from "./data";
import { PageHead, StatusPill, initials, timeAgo } from "./ui";

const ACCENT = "#00a1d6";
const MUTED = "#9db6c4";
const GRID = "#1f3a4c";
const PALETTE = ["#00a1d6", "#38c9a0", "#f2b84b", "#a78bfa", "#f27a8a", "#6aa8ff"];

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Stat({
  icon: Icon,
  label,
  value,
  note,
  tone,
  to,
}: {
  icon: typeof EnvelopeSimple;
  label: string;
  value: number | string;
  note: string;
  tone: string;
  to: string;
}) {
  return (
    <Link className={`nma-stat nma-stat--${tone}`} to={to}>
      <span className="nma-stat__icon">
        <Icon size={24} weight="duotone" />
      </span>
      <span className="nma-stat__body">
        <small>{label}</small>
        <b>{value}</b>
        <em>{note}</em>
      </span>
    </Link>
  );
}

export function Dashboard() {
  const { enquiries, posts, loading, email } = useAdminData();

  const stats = useMemo(() => {
    const now = Date.now();
    const week = 7 * 86400000;
    const thisWeek = enquiries.filter((q) => now - new Date(q.created_at).getTime() < week).length;
    const lastWeek = enquiries.filter((q) => {
      const age = now - new Date(q.created_at).getTime();
      return age >= week && age < 2 * week;
    }).length;
    return {
      fresh: enquiries.filter((q) => q.status === "new").length,
      total: enquiries.length,
      thisWeek,
      delta: thisWeek - lastWeek,
      published: posts.filter((p) => p.status === "published").length,
      drafts: posts.filter((p) => p.status === "draft").length,
    };
  }, [enquiries, posts]);

  const series = useMemo(() => {
    const days: { label: string; key: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ label: d.toLocaleDateString("en-CA", { month: "short", day: "numeric" }), key: dayKey(d), count: 0 });
    }
    const index = new Map(days.map((d, i) => [d.key, i]));
    for (const q of enquiries) {
      const i = index.get(dayKey(new Date(q.created_at)));
      if (i !== undefined) days[i]!.count += 1;
    }
    return days;
  }, [enquiries]);

  const byService = useMemo(() => {
    const map = new Map<string, number>();
    for (const q of enquiries) {
      const key = q.service || "Not specified";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));
  }, [enquiries]);

  const recent = enquiries.slice(0, 6);
  const latestPosts = posts.slice(0, 4);
  const raw = email.split("@")[0]?.replace(/[._-]+/g, " ") ?? "there";
  const name = raw.charAt(0).toUpperCase() + raw.slice(1);

  return (
    <>
      <PageHead
        actions={
          <>
            <Link className="nma-btn" to="/admin/content">
              <PencilRuler size={18} /> Edit homepage
            </Link>
            <Link className="nma-btn nma-btn--primary" search={{ new: true }} to="/admin/posts">
              <Plus size={18} weight="bold" /> New post
            </Link>
          </>
        }
        sub="Here is what is happening on your website."
        title={`${greeting()}, ${name}`}
      />

      <div className="nma-stats">
        <Stat icon={EnvelopeSimple} label="New enquiries" note={stats.fresh ? "Waiting for a reply" : "All caught up"} tone="blue" to="/admin/enquiries" value={stats.fresh} />
        <Stat
          icon={TrendUp}
          label="Enquiries this week"
          note={stats.delta === 0 ? "Same as last week" : `${stats.delta > 0 ? "+" : ""}${stats.delta} vs last week`}
          tone="green"
          to="/admin/enquiries"
          value={stats.thisWeek}
        />
        <Stat icon={Article} label="Published posts" note={`${stats.drafts} draft${stats.drafts === 1 ? "" : "s"}`} tone="amber" to="/admin/posts" value={stats.published} />
        <Stat icon={EnvelopeSimpleOpen} label="All-time enquiries" note="Since you started tracking" tone="violet" to="/admin/enquiries" value={stats.total} />
      </div>

      <div className="nma-grid">
        <section className="nma-card nma-card--wide">
          <header className="nma-card__head">
            <div>
              <h2>Enquiries, last 30 days</h2>
              <p>Messages sent through your Contact page</p>
            </div>
          </header>
          <div className="nma-chart">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={series} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="adFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={GRID} strokeDasharray="3 6" vertical={false} />
                <XAxis axisLine={false} dataKey="label" interval={4} stroke={MUTED} tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} stroke={MUTED} tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0a1923", border: "1px solid #2b4d63", borderRadius: 10, color: "#eaf4f8" }}
                  cursor={{ stroke: ACCENT, strokeOpacity: 0.3 }}
                  labelStyle={{ color: MUTED }}
                />
                <Area dataKey="count" fill="url(#adFill)" name="Enquiries" stroke={ACCENT} strokeWidth={2.5} type="monotone" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="nma-card">
          <header className="nma-card__head">
            <div>
              <h2>Interest by service</h2>
              <p>What visitors ask about</p>
            </div>
          </header>
          {byService.length === 0 ? (
            <p className="nma-empty">No enquiries yet.</p>
          ) : (
            <div className="nma-chart nma-chart--bars">
              <ResponsiveContainer height="100%" width="100%">
                <BarChart data={byService} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <XAxis hide type="number" />
                  <YAxis axisLine={false} dataKey="name" stroke={MUTED} tick={{ fontSize: 12 }} tickLine={false} type="category" width={118} />
                  <Tooltip
                    contentStyle={{ background: "#0a1923", border: "1px solid #2b4d63", borderRadius: 10, color: "#eaf4f8" }}
                    cursor={{ fill: "#ffffff0d" }}
                  />
                  <Bar barSize={14} dataKey="count" name="Enquiries" radius={7}>
                    {byService.map((_, i) => (
                      <Cell fill={PALETTE[i % PALETTE.length]} key={i} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="nma-card nma-card--wide">
          <header className="nma-card__head">
            <div>
              <h2>Latest enquiries</h2>
              <p>The six most recent messages</p>
            </div>
            <Link className="nma-link" to="/admin/enquiries">
              View all <ArrowRight size={14} />
            </Link>
          </header>
          {loading ? (
            <p className="nma-empty">Loading…</p>
          ) : recent.length === 0 ? (
            <p className="nma-empty">No enquiries yet. They will appear here as soon as someone uses your Contact page.</p>
          ) : (
            <ul className="nma-list">
              {recent.map((q) => (
                <li key={q.id}>
                  <Link search={{ id: q.id }} to="/admin/enquiries">
                    <span className="nma-avatar">{initials(q.name)}</span>
                    <span className="nma-list__main">
                      <b>{q.name}</b>
                      <small>{q.service || q.message.slice(0, 60)}</small>
                    </span>
                    <StatusPill status={q.status} />
                    <time>{timeAgo(q.created_at)}</time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="nma-card">
          <header className="nma-card__head">
            <div>
              <h2>Blog</h2>
              <p>Recent posts</p>
            </div>
            <Link className="nma-link" to="/admin/posts">
              Manage <ArrowRight size={14} />
            </Link>
          </header>
          {latestPosts.length === 0 ? (
            <p className="nma-empty">No posts yet. Write your first one.</p>
          ) : (
            <ul className="nma-list">
              {latestPosts.map((p) => (
                <li key={p.id}>
                  <Link search={{ id: p.id }} to="/admin/posts">
                    <span className="nma-list__main">
                      <b>{p.title}</b>
                      <small>{formatDate(p.published_at ?? p.created_at)}</small>
                    </span>
                    <StatusPill status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
