import { CaretLeft, CaretRight, Clock, Plus, Trash, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

import { type TimeCategory, type TimeEntry, useAdminData } from "./data";
import { Field, PageHead, useToast } from "./ui";

export const categories: { id: TimeCategory; label: string; color: string }[] = [
  { id: "work", label: "Work", color: "#12d6f0" },
  { id: "side", label: "Side projects", color: "#ff7a45" },
  { id: "social", label: "Social", color: "#35c987" },
  { id: "rest", label: "Rest", color: "#4f86ff" },
];
const catById = Object.fromEntries(categories.map((c) => [c.id, c])) as Record<TimeCategory, (typeof categories)[number]>;

type Period = "week" | "month" | "year";

// ── date helpers (all local time, "YYYY-MM-DD" keys) ──────────────────────────
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => new Date(`${s}T00:00:00`);
const addDays = (d: Date, n: number) => {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
};
const mondayOf = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));

function fmt(min: number) {
  if (min <= 0) return "0M";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? (m ? `${h}H ${m}M` : `${h}H`) : `${m}M`;
}

type DayTotals = { total: number; by: Record<TimeCategory, number> };
const emptyDay = (): DayTotals => ({ total: 0, by: { work: 0, side: 0, social: 0, rest: 0 } });

function dominant(t: DayTotals | undefined): TimeCategory | null {
  if (!t || t.total <= 0) return null;
  return categories.reduce((best, c) => (t.by[c.id] > t.by[best] ? c.id : best), "work" as TimeCategory);
}

function cellStyle(t: DayTotals | undefined) {
  const cat = dominant(t);
  if (!cat) return undefined;
  const m = t!.total;
  const strength = m < 60 ? 38 : m < 180 ? 62 : m < 360 ? 84 : 100;
  return { background: `color-mix(in srgb, ${catById[cat].color} ${strength}%, transparent)` };
}

function periodRange(period: Period, anchor: Date) {
  if (period === "week") {
    const s = mondayOf(anchor);
    return { start: s, end: addDays(s, 6) };
  }
  if (period === "month") return { start: new Date(anchor.getFullYear(), anchor.getMonth(), 1), end: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0) };
  return { start: new Date(anchor.getFullYear(), 0, 1), end: new Date(anchor.getFullYear(), 11, 31) };
}

function periodLabel(period: Period, start: Date, end: Date) {
  if (period === "year") return String(start.getFullYear());
  if (period === "month") return start.toLocaleDateString("en-CA", { month: "long", year: "numeric" });
  const a = start.toLocaleDateString("en-CA", { day: "numeric", month: "short" });
  const b = end.toLocaleDateString("en-CA", { day: "numeric", month: "short", year: "numeric" });
  return `${a} – ${b}`;
}

const longDay = (d: Date) => d.toLocaleDateString("en-CA", { weekday: "long", day: "numeric", month: "long" });

function LogModal({ day, onClose }: { day: string; onClose: () => void }) {
  const { logTime } = useAdminData();
  const toast = useToast();
  const [form, setForm] = useState({ day, category: "work" as TimeCategory, hours: "1", minutes: "0", note: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = async () => {
    const minutes = Math.round(Number(form.hours || 0) * 60 + Number(form.minutes || 0));
    if (minutes < 1) return toast("Enter how long it took.", "err");
    if (minutes > 1440) return toast("That is more than 24 hours.", "err");
    setBusy(true);
    try {
      await logTime({ day: form.day, category: form.category, minutes, note: form.note.trim() });
      toast("Time logged.");
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save.", "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="nma-modal" onClick={onClose} role="presentation">
      <div aria-modal="true" className="nma-modal__card nma-modal__card--wide" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="nma-card__head">
          <div>
            <h2>Log time</h2>
            <p>Record time you spent. Timers on tasks are added here automatically.</p>
          </div>
          <button aria-label="Close" className="nma-iconbtn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>
        <div className="nma-stack">
          <div className="nma-cols nma-cols--2">
            <Field label="Date">
              <input max={ymd(new Date())} onChange={(e) => setForm({ ...form, day: e.target.value })} type="date" value={form.day} />
            </Field>
            <Field label="Category">
              <select onChange={(e) => setForm({ ...form, category: e.target.value as TimeCategory })} value={form.category}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hours">
              <input min="0" onChange={(e) => setForm({ ...form, hours: e.target.value })} type="number" value={form.hours} />
            </Field>
            <Field label="Minutes">
              <input max="59" min="0" onChange={(e) => setForm({ ...form, minutes: e.target.value })} type="number" value={form.minutes} />
            </Field>
          </div>
          <Field label="Note (optional)">
            <input onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="What did you work on?" value={form.note} />
          </Field>
        </div>
        <div className="nma-editor__foot">
          <span />
          <div className="nma-row-actions">
            <button className="nma-btn" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="nma-btn nma-btn--primary" disabled={busy} onClick={() => void save()} type="button">
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InsightsPage() {
  const { entries, entriesReady, tasks, loading, deleteTimeEntry } = useAdminData();
  const toast = useToast();
  const [period, setPeriod] = useState<Period>("month");
  const [anchor, setAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => ymd(new Date()));
  const [logging, setLogging] = useState(false);

  const todayKey = ymd(new Date());

  const byDay = useMemo(() => {
    const map = new Map<string, DayTotals>();
    for (const e of entries) {
      const t = map.get(e.day) ?? emptyDay();
      t.total += e.minutes;
      t.by[e.category] += e.minutes;
      map.set(e.day, t);
    }
    return map;
  }, [entries]);

  const { start, end } = periodRange(period, anchor);
  const startKey = ymd(start);
  const endKey = ymd(end);

  const stats = useMemo(() => {
    const totals = emptyDay();
    let active = 0;
    let best: { key: string; total: number } | null = null;
    for (let d = new Date(start); ymd(d) <= endKey; d = addDays(d, 1)) {
      const t = byDay.get(ymd(d));
      if (!t) continue;
      totals.total += t.total;
      for (const c of categories) totals.by[c.id] += t.by[c.id];
      active += 1;
      if (!best || t.total > best.total) best = { key: ymd(d), total: t.total };
    }
    const elapsedDays = Math.max(1, Math.min(Math.round((new Date(`${todayKey}T00:00:00`).getTime() - start.getTime()) / 86400000) + 1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1));
    let streak = 0;
    let cursor = byDay.has(todayKey) ? new Date() : addDays(new Date(), -1);
    while (byDay.has(ymd(cursor))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    const done = tasks.filter((t) => t.status === "done" && t.updated_at.slice(0, 10) >= startKey && t.updated_at.slice(0, 10) <= endKey).length;
    return { totals, active, best, elapsedDays, streak, done };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byDay, startKey, endKey, tasks, todayKey]);

  const top = categories.reduce((b, c) => (stats.totals.by[c.id] > stats.totals.by[b.id] ? c : b), categories[0]!);
  const unit = period === "year" ? "year" : period === "week" ? "week" : "month";
  const label = periodLabel(period, start, end);

  const shift = (dir: 1 | -1) => {
    const d = new Date(anchor);
    if (period === "week") d.setDate(d.getDate() + 7 * dir);
    else if (period === "month") d.setMonth(d.getMonth() + dir, 1);
    else d.setFullYear(d.getFullYear() + dir);
    setAnchor(d);
  };

  // Keep the selected day inside the visible period.
  useEffect(() => {
    if (selected < startKey || selected > endKey) setSelected(todayKey >= startKey && todayKey <= endKey ? todayKey : startKey);
  }, [startKey, endKey, selected, todayKey]);

  // Squares: weekday-aligned grid for week/month, month cells for the year view.
  const squares = useMemo(() => {
    if (period === "year") return null;
    const cells: (string | null)[] = [];
    const lead = (start.getDay() + 6) % 7;
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let d = new Date(start); ymd(d) <= endKey; d = addDays(d, 1)) cells.push(ymd(d));
    return cells;
  }, [period, start, endKey]);

  const monthCells = useMemo(() => {
    if (period !== "year") return [];
    return Array.from({ length: 12 }, (_, m) => {
      const t = emptyDay();
      for (const [k, v] of byDay) {
        if (k.startsWith(`${start.getFullYear()}-${pad(m + 1)}-`)) {
          t.total += v.total;
          for (const c of categories) t.by[c.id] += v.by[c.id];
        }
      }
      return { m, t };
    });
  }, [period, byDay, start]);

  const dayEntries = entries.filter((e) => e.day === selected);
  const selTotals = byDay.get(selected);

  // 12-month heatmap: 53 weekly columns ending with the current week.
  const heat = useMemo(() => {
    const endMon = mondayOf(new Date());
    const first = addDays(endMon, -52 * 7);
    const weeks: { key: string; monthLabel: string }[][] = [];
    let lastMonth = -1;
    const labelAt: string[] = [];
    for (let w = 0; w < 53; w++) {
      const col: { key: string; monthLabel: string }[] = [];
      for (let d = 0; d < 7; d++) col.push({ key: ymd(addDays(first, w * 7 + d)), monthLabel: "" });
      weeks.push(col);
      const mon = addDays(first, w * 7);
      labelAt.push(mon.getMonth() !== lastMonth ? mon.toLocaleDateString("en-CA", { month: "short" }) : "");
      lastMonth = mon.getMonth();
    }
    return { weeks, labelAt };
  }, []);

  const summary =
    stats.totals.total > 0
      ? (
          <>
            {period === "week" ? "This week" : label} so far: <b>{fmt(stats.totals.total)}</b> logged. Most of it went to <b style={{ color: top.color }}>{top.label}</b>.
          </>
        )
      : <>Nothing logged for {period === "year" ? "this year" : `this ${unit}`} yet. Use <b>Log time</b>, or start a timer on a task.</>;

  if (!loading && !entriesReady) {
    return (
      <>
        <PageHead sub="Where your time actually went" title="Insights" />
        <div className="nma-card nma-empty nma-empty--big">
          <Clock size={44} weight="duotone" />
          <p>
            The time log table isn&rsquo;t set up yet. In Supabase, open the SQL Editor, run <b>app/supabase/insights-analytics.sql</b>, then reload this page.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead
        actions={
          <button className="nma-btn nma-btn--primary" onClick={() => setLogging(true)} type="button">
            <Plus size={18} weight="bold" /> Log time
          </button>
        }
        sub="Where your time actually went"
        title="Insights"
      />

      <div className="nma-insbar">
        <div className="nma-seg" role="group">
          {(["week", "month", "year"] as const).map((p) => (
            <button className={period === p ? "is-active" : ""} key={p} onClick={() => setPeriod(p)} type="button">
              {p === "week" ? "Week" : p === "month" ? "Month" : "Year"}
            </button>
          ))}
        </div>
        <div className="nma-pernav">
          <button aria-label="Previous" className="nma-iconbtn" onClick={() => shift(-1)} type="button">
            <CaretLeft size={16} />
          </button>
          <span>{label}</span>
          <button aria-label="Next" className="nma-iconbtn" onClick={() => shift(1)} type="button">
            <CaretRight size={16} />
          </button>
        </div>
      </div>

      <div className="nma-card nma-summary">{summary}</div>

      <div className="nma-card nma-logged">
        <div className="nma-logged__main">
          <small className="nma-mono">Logged {period === "week" ? "this week" : label}</small>
          <div className="nma-logged__big">{fmt(stats.totals.total)}</div>
          <div className="nma-segbar">
            {categories.map((c) =>
              stats.totals.by[c.id] > 0 ? <i key={c.id} style={{ flex: stats.totals.by[c.id], background: c.color }} /> : null,
            )}
          </div>
          <ul className="nma-legend">
            {categories.map((c) => (
              <li key={c.id}>
                <i style={{ background: c.color }} /> {c.label} <b>{fmt(stats.totals.by[c.id])}</b>
              </li>
            ))}
          </ul>

          <div className="nma-dayentries">
            <h3>{longDay(parse(selected))}</h3>
            {dayEntries.length === 0 ? (
              <p>Nothing logged this day.</p>
            ) : (
              <ul>
                {dayEntries.map((e: TimeEntry) => (
                  <li key={e.id}>
                    <i style={{ background: catById[e.category].color }} />
                    <span>{e.note || catById[e.category].label}</span>
                    <em>{catById[e.category].label}</em>
                    <b>{fmt(e.minutes)}</b>
                    <button
                      aria-label="Delete entry"
                      className="nma-iconbtn"
                      onClick={() => void deleteTimeEntry(e.id).catch((err: unknown) => toast(err instanceof Error ? err.message : "Could not delete.", "err"))}
                      type="button"
                    >
                      <Trash size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="nma-squares">
          <small className="nma-mono">{period === "year" ? `${start.getFullYear()} months` : `${label.split(" ")[0]} squares`}</small>
          {period === "year" ? (
            <div className="nma-months">
              {monthCells.map(({ m, t }) => (
                <button
                  key={m}
                  onClick={() => {
                    setAnchor(new Date(start.getFullYear(), m, 1));
                    setPeriod("month");
                  }}
                  title={`${new Date(2000, m, 1).toLocaleDateString("en-CA", { month: "long" })}: ${fmt(t.total)}`}
                  type="button"
                >
                  <span className="nma-sq" style={cellStyle(t)} />
                  <em>{new Date(2000, m, 1).toLocaleDateString("en-CA", { month: "short" })}</em>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="nma-sqgrid">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span className="nma-sqhead" key={i}>
                    {d}
                  </span>
                ))}
                {squares!.map((key, i) =>
                  key ? (
                    <button
                      className={`nma-sq ${key === selected ? "is-selected" : ""} ${key === todayKey ? "is-today" : ""}`}
                      key={key}
                      onClick={() => setSelected(key)}
                      style={cellStyle(byDay.get(key))}
                      title={`${longDay(parse(key))}: ${fmt(byDay.get(key)?.total ?? 0)}`}
                      type="button"
                    />
                  ) : (
                    <span key={`b${i}`} />
                  ),
                )}
              </div>
              <p className="nma-sqcap">
                {longDay(parse(selected))}: {selTotals ? fmt(selTotals.total) : "nothing logged"}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="nma-mstats">
        <div className="nma-mstat">
          <small>Active days</small>
          <b>{stats.active}</b>
          <em>of {stats.elapsedDays} days</em>
        </div>
        <div className="nma-mstat">
          <small>Best day</small>
          <b>{stats.best ? fmt(stats.best.total) : "—"}</b>
          <em>{stats.best ? parse(stats.best.key).toLocaleDateString("en-CA", { weekday: "short", day: "numeric", month: "short" }) : "Nothing yet"}</em>
        </div>
        <div className="nma-mstat">
          <small>Day streak</small>
          <b>{stats.streak}</b>
          <em>days logged in a row</em>
        </div>
        <div className="nma-mstat">
          <small>Tasks done</small>
          <b>{stats.done}</b>
          <em>tasks</em>
        </div>
        <div className="nma-mstat">
          <small>Average per active day</small>
          <b>{stats.active ? fmt(Math.round(stats.totals.total / stats.active)) : "—"}</b>
          <em>{stats.active ? "on days you logged time" : "No time logged"}</em>
        </div>
      </div>

      <div className="nma-card nma-heat">
        <header className="nma-card__head">
          <h2>The last 12 months</h2>
          <p>Each square is a day, coloured by where most time went</p>
        </header>
        <div className="nma-heat__scroll">
          <div className="nma-heat__months" style={{ gridTemplateColumns: `repeat(53, 1fr)` }}>
            {heat.labelAt.map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
          <div className="nma-heat__grid">
            {heat.weeks.map((col, w) => (
              <div key={w}>
                {col.map(({ key }) => (
                  <button
                    className={`nma-sq nma-sq--s ${key === todayKey ? "is-today" : ""} ${key > todayKey ? "is-future" : ""}`}
                    disabled={key > todayKey}
                    key={key}
                    onClick={() => {
                      setSelected(key);
                      setAnchor(parse(key));
                      setPeriod("month");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    style={cellStyle(byDay.get(key))}
                    title={`${longDay(parse(key))}: ${fmt(byDay.get(key)?.total ?? 0)}`}
                    type="button"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {logging ? <LogModal day={selected <= todayKey ? selected : todayKey} onClose={() => setLogging(false)} /> : null}
    </>
  );
}
