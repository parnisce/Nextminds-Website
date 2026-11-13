import { ArrowClockwise, ChartLineUp } from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { NO_TRACK_KEY } from "@/components/analytics/tracker";
import { supabase } from "@/lib/supabase";

import { useAdminData } from "./data";
import { PageHead } from "./ui";

type Row = {
  created_at: string;
  session_id: string;
  kind: "view" | "action" | "message";
  path: string;
  label: string | null;
  referrer: string | null;
  device: "desktop" | "tablet" | "mobile" | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

const COLS = "created_at,session_id,kind,path,label,referrer,device,utm_source,utm_medium,utm_campaign";
const PAGE = 1000;
const MAX_ROWS = 30000;

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function count<T>(items: T[], key: (t: T) => string | null | undefined) {
  const map = new Map<string, number>();
  for (const i of items) {
    const k = key(i);
    if (k) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function RankList({ rows, empty }: { rows: [string, number][]; empty: React.ReactNode }) {
  if (rows.length === 0) return <p className="nma-an__empty">{empty}</p>;
  const max = rows[0]![1];
  return (
    <ul className="nma-rank">
      {rows.map(([name, n]) => (
        <li key={name}>
          <i style={{ width: `${Math.max(3, (n / max) * 100)}%` }} />
          <span title={name}>{name}</span>
          <b>{n}</b>
        </li>
      ))}
    </ul>
  );
}

export function AnalyticsPage() {
  const { demo } = useAdminData();
  const [days, setDays] = useState<7 | 30 | 90>(30);
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [message, setMessage] = useState("");
  const [skip, setSkip] = useState(true);

  // "Do not count visits from this browser": on by default for the admin's own browser.
  useEffect(() => {
    try {
      const v = localStorage.getItem(NO_TRACK_KEY);
      if (v === null) localStorage.setItem(NO_TRACK_KEY, "1");
      setSkip(v === null ? true : v === "1");
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleSkip = (on: boolean) => {
    setSkip(on);
    try {
      localStorage.setItem(NO_TRACK_KEY, on ? "1" : "0");
    } catch {
      /* storage unavailable */
    }
  };

  const load = useCallback(async () => {
    setState("loading");
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    since.setHours(0, 0, 0, 0);
    const all: Row[] = [];
    if (demo) {
      // Dev-only sample traffic for /admin?demo.
      const pages = ["/", "/", "/", "/blog", "/contact", "/services/ai-agents-development", "/services/e-commerce-services"];
      const refs = [null, null, null, "www.google.com", "github.com", "linkedin.com"];
      for (let i = 0; i < days * 7; i++) {
        const t = new Date(Date.now() - ((i * 0.6180339) % 1) * days * 86400000);
        const sid = `demo${String(i).padStart(8, "0")}`;
        const dev = (["desktop", "desktop", "tablet", "mobile"] as const)[i % 4]!;
        all.push({ created_at: t.toISOString(), session_id: sid, kind: "view", path: pages[i % pages.length]!, label: null, referrer: refs[i % refs.length]!, device: dev, utm_source: i % 17 === 0 ? "linkedin" : null, utm_medium: i % 17 === 0 ? "social" : null, utm_campaign: null });
        if (i % 3 === 0) all.push({ created_at: t.toISOString(), session_id: sid, kind: "view", path: "/contact", label: null, referrer: null, device: dev, utm_source: null, utm_medium: null, utm_campaign: null });
        if (i % 9 === 0) all.push({ created_at: t.toISOString(), session_id: sid, kind: "action", path: "/", label: "Outside link clicked \u00b7 github.com", referrer: null, device: dev, utm_source: null, utm_medium: null, utm_campaign: null });
        if (i % 23 === 0) all.push({ created_at: t.toISOString(), session_id: sid, kind: "message", path: "/contact", label: "Contact form sent", referrer: null, device: dev, utm_source: null, utm_medium: null, utm_campaign: null });
      }
      all.sort((x, y) => x.created_at.localeCompare(y.created_at));
      setRows(all);
      setState("ready");
      return;
    }
    for (let from = 0; from < MAX_ROWS; from += PAGE) {
      const { data, error } = await supabase()
        .from("page_views")
        .select(COLS)
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) {
        setMessage(error.message);
        setState(error.code === "42P01" || /schema cache|does not exist/i.test(error.message) ? "missing" : "error");
        return;
      }
      all.push(...((data as Row[] | null) ?? []));
      if (!data || data.length < PAGE) break;
    }
    setRows(all);
    setState("ready");
  }, [days, demo]);

  useEffect(() => {
    void load();
  }, [load]);

  const a = useMemo(() => {
    const views = rows.filter((r) => r.kind === "view");
    const sessions = new Set(rows.map((r) => r.session_id));
    const messaged = new Set(rows.filter((r) => r.kind === "message").map((r) => r.session_id));
    const messages = rows.filter((r) => r.kind === "message").length;

    // First view of each session decides its source and device.
    const firstBySession = new Map<string, Row>();
    for (const r of views) if (!firstBySession.has(r.session_id)) firstBySession.set(r.session_id, r);
    const firsts = [...firstBySession.values()];

    const series: { key: string; label: string; views: number; visits: number }[] = [];
    const index = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      index.set(dayKey(d), series.length);
      series.push({ key: dayKey(d), label: d.toLocaleDateString("en-CA", { weekday: "short", day: "numeric", month: "short" }), views: 0, visits: 0 });
    }
    const seenPerDay = new Set<string>();
    for (const r of views) {
      const k = dayKey(new Date(r.created_at));
      const i = index.get(k);
      if (i === undefined) continue;
      series[i]!.views += 1;
      if (!seenPerDay.has(`${k}|${r.session_id}`)) {
        seenPerDay.add(`${k}|${r.session_id}`);
        series[i]!.visits += 1;
      }
    }

    const campaigns = count(
      firsts.filter((r) => r.utm_source || r.utm_campaign),
      (r) => [r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(" / "),
    );

    return {
      visits: sessions.size,
      views: views.length,
      messages,
      conversion: sessions.size ? (messaged.size / sessions.size) * 100 : 0,
      series,
      topPages: count(views, (r) => r.path).slice(0, 8),
      sources: count(firsts, (r) => r.referrer ?? "Direct / none").slice(0, 8),
      devices: count(firsts, (r) => (r.device ? r.device[0]!.toUpperCase() + r.device.slice(1) : "Unknown")),
      actions: count(rows.filter((r) => r.kind === "action"), (r) => r.label).slice(0, 8),
      campaigns: campaigns.slice(0, 8),
    };
  }, [rows, days]);

  const maxViews = Math.max(1, ...a.series.map((s) => s.views));

  if (state === "missing") {
    return (
      <>
        <PageHead sub="Visits to your public site, saved in your own Supabase." title="Analytics" />
        <div className="nma-card nma-empty nma-empty--big">
          <ChartLineUp size={44} weight="duotone" />
          <p>
            The analytics table isn&rsquo;t set up yet. In Supabase, open the SQL Editor, run <b>app/supabase/insights-analytics.sql</b>, then reload this page.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="nma-pagehead">
        <div>
          <h1>Analytics</h1>
          <p>Visits to your public site, saved in your own Supabase. No cookies and no IP addresses.</p>
        </div>
        <div className="nma-pagehead__actions">
          <div className="nma-seg" role="group">
            {([7, 30, 90] as const).map((d) => (
              <button className={days === d ? "is-active" : ""} key={d} onClick={() => setDays(d)} type="button">
                {d} days
              </button>
            ))}
          </div>
          <button className="nma-btn" disabled={state === "loading"} onClick={() => void load()} type="button">
            <ArrowClockwise size={16} /> Refresh
          </button>
        </div>
      </div>

      {state === "error" ? (
        <div className="nma-alert" role="alert">
          Could not load analytics. {message}
        </div>
      ) : null}

      <div className="nma-mstats">
        <div className="nma-mstat">
          <small>Visits</small>
          <b>{a.visits}</b>
          <em>one per browsing session</em>
        </div>
        <div className="nma-mstat">
          <small>Page views</small>
          <b>{a.views}</b>
          <em>{a.visits ? (a.views / a.visits).toFixed(1) : "0.0"} per visit</em>
        </div>
        <div className="nma-mstat">
          <small>Messages sent</small>
          <b>{a.messages}</b>
          <em>contact form</em>
        </div>
        <div className="nma-mstat">
          <small>Conversion</small>
          <b>{a.conversion.toFixed(1)}%</b>
          <em>visits that sent a message</em>
        </div>
        <div className="nma-mstat">
          <small>Rows loaded</small>
          <b>{rows.length}</b>
          <em>in this period</em>
        </div>
      </div>

      <section className="nma-card nma-an">
        <header className="nma-card__head">
          <h2>Page views per day</h2>
          <p>Bars are page views; the hover text also shows visits</p>
        </header>
        <div className="nma-bars" style={{ gridTemplateColumns: `repeat(${a.series.length}, minmax(0, 1fr))` }}>
          {a.series.map((s) => (
            <div className="nma-bars__col" key={s.key} title={`${s.label}: ${s.views} page view${s.views === 1 ? "" : "s"}, ${s.visits} visit${s.visits === 1 ? "" : "s"}`}>
              <i style={{ height: `${s.views ? Math.max(3, (s.views / maxViews) * 100) : 1}%` }} />
            </div>
          ))}
        </div>
      </section>

      <div className="nma-angrid">
        <section className="nma-card nma-an">
          <h2>Top pages</h2>
          <RankList empty="No visits yet." rows={a.topPages} />
        </section>
        <section className="nma-card nma-an">
          <h2>Where visitors came from</h2>
          <RankList empty="No visits yet." rows={a.sources} />
        </section>
        <section className="nma-card nma-an">
          <h2>Devices</h2>
          <RankList empty="No visits yet." rows={a.devices} />
        </section>
        <section className="nma-card nma-an">
          <h2>Actions</h2>
          <RankList empty="No clicks recorded yet." rows={a.actions} />
        </section>
        <section className="nma-card nma-an">
          <h2>Campaigns (UTM)</h2>
          <RankList empty="No tagged links yet. Add ?utm_source=linkedin to a link you share." rows={a.campaigns} />
        </section>
      </div>

      <label className="nma-notrack">
        <input checked={skip} onChange={(e) => toggleSkip(e.target.checked)} type="checkbox" />
        <span>
          Do not count visits from this browser
          <small>Keeps your own testing out of the numbers. Turn it off to test tracking yourself.</small>
        </span>
      </label>
    </>
  );
}
