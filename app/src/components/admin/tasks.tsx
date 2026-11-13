import { CheckSquare, ListChecks, Pause, Play, Plus, SquaresFour, Trash, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState, type DragEvent } from "react";

import { type Task, type TaskPriority, type TaskStatus, useAdminData } from "./data";
import { Confirm, Field, PageHead, useToast } from "./ui";

const columns: { id: TaskStatus; label: string; tone: string }[] = [
  { id: "open", label: "Open", tone: "grey" },
  { id: "in_progress", label: "In progress", tone: "violet" },
  { id: "blocked", label: "Blocked", tone: "red" },
  { id: "done", label: "Done", tone: "green" },
];

const statusText = Object.fromEntries(columns.map((c) => [c.id, c.label])) as Record<TaskStatus, string>;
const priorityText: Record<TaskPriority, string> = { low: "Low", medium: "Medium", high: "High" };

const today = () => new Date().toISOString().slice(0, 10);
const fmtDay = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-CA", { day: "numeric", month: "short" });

function elapsed(t: Task, now: number) {
  const running = t.timer_started_at ? Math.max(0, Math.floor((now - new Date(t.timer_started_at).getTime()) / 1000)) : 0;
  return t.time_seconds + running;
}

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h) return `${h}H ${m}M`;
  if (m) return `${m}M`;
  return sec > 0 ? "<1M" : "0M";
}

function Card({
  task,
  now,
  dragging,
  onOpen,
  onToggleTimer,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  now: number;
  dragging: boolean;
  onOpen: () => void;
  onToggleTimer: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const overdue = task.due_date && task.status !== "done" && task.due_date < today();
  const done = task.checklist.filter((c) => c.done).length;
  const running = Boolean(task.timer_started_at);

  return (
    <article
      className={`nma-task ${running ? "is-running" : ""} ${dragging ? "is-dragging" : ""}`}
      draggable
      onClick={onOpen}
      onDragEnd={onDragEnd}
      onDragStart={(e: DragEvent) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
    >
      <p className={`nma-task__status nma-task__status--${task.status}`}>
        <i /> {statusText[task.status]}
      </p>
      <h3>{task.title}</h3>
      {task.description ? <p className="nma-task__desc">{task.description}</p> : null}
      <div className="nma-task__chips">
        <span className={`nma-chip nma-chip--${task.priority}`}>{priorityText[task.priority]}</span>
        {task.due_date ? (
          <span className={`nma-chip ${overdue ? "nma-chip--overdue" : "nma-chip--due"}`}>
            {overdue ? "Overdue" : "Due"} {fmtDay(task.due_date)}
          </span>
        ) : null}
        {task.tag ? <span className="nma-chip nma-chip--tag">{task.tag}</span> : null}
      </div>
      <div className="nma-task__foot">
        <span className="nma-task__time">{fmtTime(elapsed(task, now))}</span>
        {task.checklist.length ? (
          <span className="nma-task__check">
            <CheckSquare size={14} /> {done}/{task.checklist.length}
          </span>
        ) : null}
        <button
          aria-label={running ? "Pause timer" : "Start timer"}
          className="nma-task__play"
          onClick={(e) => {
            e.stopPropagation();
            onToggleTimer();
          }}
          type="button"
        >
          {running ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
        </button>
      </div>
    </article>
  );
}

function TaskModal({ task, startStatus, onClose }: { task: Task | null; startStatus: TaskStatus; onClose: () => void }) {
  const { createTask, updateTask, deleteTask } = useAdminData();
  const toast = useToast();
  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? startStatus,
    priority: task?.priority ?? ("medium" as TaskPriority),
    due_date: task?.due_date ?? "",
    tag: task?.tag ?? "",
    estimate: task?.estimate_minutes ? String(task.estimate_minutes / 60) : "",
    checklist: task?.checklist ?? [],
  });
  const [item, setItem] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const patch = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));

  const save = async () => {
    if (!form.title.trim()) return toast("Give the task a title.", "err");
    setBusy(true);
    const estimate = Math.max(0, Math.round(Number(form.estimate || 0) * 60));
    const body = {
      ...(estimate || task?.estimate_minutes ? { estimate_minutes: estimate } : {}),
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      due_date: form.due_date || null,
      tag: form.tag.trim(),
      checklist: form.checklist,
    };
    try {
      if (task) await updateTask(task.id, body);
      else await createTask(body);
      toast(task ? "Task saved." : "Task added.");
      onClose();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save the task.", "err");
    } finally {
      setBusy(false);
    }
  };

  const addItem = () => {
    if (!item.trim()) return;
    patch({ checklist: [...form.checklist, { text: item.trim(), done: false }] });
    setItem("");
  };

  return (
    <div className="nma-modal" onClick={onClose} role="presentation">
      <div aria-modal="true" className="nma-modal__card nma-modal__card--wide" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="nma-card__head">
          <div>
            <h2>{task ? "Edit task" : "New task"}</h2>
            <p>Notes, deadline and progress for this website.</p>
          </div>
          <button aria-label="Close" className="nma-iconbtn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </header>

        <div className="nma-stack">
          <Field label="Title">
            <input autoFocus onChange={(e) => patch({ title: e.target.value })} placeholder="What needs doing?" value={form.title} />
          </Field>
          <Field label="Notes">
            <textarea onChange={(e) => patch({ description: e.target.value })} placeholder="Details, links, things to remember" rows={4} value={form.description} />
          </Field>
          <div className="nma-cols nma-cols--2">
            <Field label="Status">
              <select onChange={(e) => patch({ status: e.target.value as TaskStatus })} value={form.status}>
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select onChange={(e) => patch({ priority: e.target.value as TaskPriority })} value={form.priority}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </Field>
            <Field label="Due date">
              <input onChange={(e) => patch({ due_date: e.target.value })} type="date" value={form.due_date} />
            </Field>
            <Field label="Tag">
              <input onChange={(e) => patch({ tag: e.target.value })} placeholder="website, content, design…" value={form.tag} />
            </Field>
            <Field hint="Used in the time summary" label="Estimate (hours)">
              <input min="0" onChange={(e) => patch({ estimate: e.target.value })} placeholder="e.g. 1.5" step="0.25" type="number" value={form.estimate} />
            </Field>
          </div>

          <div className="nma-field">
            <span>Checklist</span>
            <ul className="nma-check">
              {form.checklist.map((c, i) => (
                <li key={i}>
                  <label>
                    <input
                      checked={c.done}
                      onChange={() => patch({ checklist: form.checklist.map((x, j) => (j === i ? { ...x, done: !x.done } : x)) })}
                      type="checkbox"
                    />
                    <span className={c.done ? "is-done" : ""}>{c.text}</span>
                  </label>
                  <button aria-label="Remove item" className="nma-iconbtn" onClick={() => patch({ checklist: form.checklist.filter((_, j) => j !== i) })} type="button">
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="nma-check__add">
              <input
                onChange={(e) => setItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                }}
                placeholder="Add a checklist item and press Enter"
                value={item}
              />
              <button className="nma-btn" onClick={addItem} type="button">
                <Plus size={16} weight="bold" /> Add
              </button>
            </div>
          </div>
        </div>

        <div className="nma-editor__foot">
          {task ? (
            <button className="nma-btn nma-btn--ghost nma-btn--red" onClick={() => setConfirm(true)} type="button">
              <Trash size={16} /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="nma-row-actions">
            <button className="nma-btn" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="nma-btn nma-btn--primary" disabled={busy} onClick={() => void save()} type="button">
              {busy ? "Saving…" : task ? "Save task" : "Add task"}
            </button>
          </div>
        </div>

        <Confirm
          action="Delete task"
          onCancel={() => setConfirm(false)}
          onConfirm={() => {
            if (!task) return;
            void deleteTask(task.id)
              .then(() => {
                toast("Task deleted.");
                onClose();
              })
              .catch((e: unknown) => toast(e instanceof Error ? e.message : "Could not delete.", "err"));
          }}
          open={confirm}
          text="This permanently removes the task and its notes."
          title="Delete this task?"
        />
      </div>
    </div>
  );
}

function Summary({ tasks, now }: { tasks: Task[]; now: number }) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const logged = tasks.reduce((n, t) => n + elapsed(t, now), 0);
  const estimated = tasks.reduce((n, t) => n + (t.estimate_minutes ?? 0) * 60, 0);
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  const open = tasks.filter((t) => t.status === "open").length;

  const dated = tasks.filter((t) => t.status !== "done" && t.due_date).sort((a, b) => a.due_date!.localeCompare(b.due_date!));
  const next = dated[0];
  let dueText = "No due dates";
  let dueLate = false;
  if (next?.due_date) {
    const days = Math.round((new Date(`${next.due_date}T00:00:00`).getTime() - new Date(`${today()}T00:00:00`).getTime()) / 86400000);
    dueLate = days < 0;
    dueText = days < 0 ? `${-days} day${days === -1 ? "" : "s"} late` : days === 0 ? "Due today" : `in ${days} day${days === 1 ? "" : "s"}`;
  }

  const bar = (ratio: number) => (
    <span className="nma-tbar">
      <i style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%` }} />
    </span>
  );

  return (
    <div className="nma-tstats">
      <div>
        <small>Tasks done</small>
        <b>
          {done} / {total}
        </b>
        {bar(total ? done / total : 0)}
      </div>
      <div>
        <small>Time logged</small>
        <b>{fmtTime(logged)}</b>
        {estimated ? (
          <>
            <em>of {fmtTime(estimated)} estimated</em>
            {bar(logged / estimated)}
          </>
        ) : (
          <em>Add estimates to track against</em>
        )}
      </div>
      <div>
        <small>In progress</small>
        <b>{inProgress}</b>
        <em>
          {blocked} blocked · {open} open
        </em>
      </div>
      <div>
        <small>Due</small>
        <b className={dueLate ? "is-late" : ""}>{dueText}</b>
        <em>
          {next?.due_date
            ? new Date(`${next.due_date}T00:00:00`).toLocaleDateString("en-CA", { weekday: "long", day: "numeric", month: "long" })
            : "Nothing scheduled"}
        </em>
      </div>
    </div>
  );
}

export function TasksPage() {
  const { tasks, tasksReady, loading, updateTask } = useAdminData();
  const toast = useToast();
  const [view, setView] = useState<"board" | "list">("board");
  const [modal, setModal] = useState<{ task: Task | null; status: TaskStatus } | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Remember the chosen view.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nma-task-view");
      if (saved === "list" || saved === "board") setView(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);
  const chooseView = (v: "board" | "list") => {
    setView(v);
    try {
      localStorage.setItem("nma-task-view", v);
    } catch {
      /* storage unavailable */
    }
  };

  const anyRunning = tasks.some((t) => t.timer_started_at);
  useEffect(() => {
    if (!anyRunning) return;
    const id = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, [anyRunning]);

  const grouped = useMemo(() => {
    const priorityRank = { high: 0, medium: 1, low: 2 };
    return Object.fromEntries(
      columns.map((c) => [
        c.id,
        tasks
          .filter((t) => t.status === c.id)
          .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || (a.due_date ?? "9").localeCompare(b.due_date ?? "9")),
      ]),
    ) as Record<TaskStatus, Task[]>;
  }, [tasks]);

  const fail = (e: unknown) => toast(e instanceof Error ? e.message : "Could not update the task.", "err");

  const toggleTimer = (t: Task) => {
    const at = Date.now();
    setNow(at);
    if (t.timer_started_at) {
      void updateTask(t.id, { time_seconds: elapsed(t, at), timer_started_at: null }).catch(fail);
    } else {
      void updateTask(t.id, { timer_started_at: new Date(at).toISOString() }).catch(fail);
    }
  };

  const move = (id: string, status: TaskStatus) => {
    const t = tasks.find((x) => x.id === id);
    if (!t || t.status === status) return;
    const patch: Parameters<typeof updateTask>[1] = { status };
    // Finishing a task stops its timer and keeps the time.
    if (status === "done" && t.timer_started_at) {
      patch.time_seconds = elapsed(t, Date.now());
      patch.timer_started_at = null;
    }
    void updateTask(id, patch).catch(fail);
  };

  const dropOn = (e: DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setOver(null);
    setDragId(null);
    move(e.dataTransfer.getData("text/plain") || (dragId ?? ""), status);
  };

  if (!loading && !tasksReady) {
    return (
      <>
        <PageHead sub="Keep notes and track work on this website." title="Tasks" />
        <div className="nma-card nma-empty nma-empty--big">
          <ListChecks size={44} weight="duotone" />
          <p>
            The tasks table isn&rsquo;t set up yet. In Supabase, open the SQL Editor, run <b>app/supabase/tasks.sql</b>, then reload this page.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="nma-pagehead">
        <div>
          <h1>
            Tasks <span className="nma-count">{tasks.length}</span>
          </h1>
          <p>{view === "board" ? "Drag a card to another column to change its status" : "Click a task to edit it"}</p>
        </div>
        <div className="nma-pagehead__actions">
          <div className="nma-seg" role="group">
            <button className={view === "list" ? "is-active" : ""} onClick={() => chooseView("list")} type="button">
              <ListChecks size={16} /> List
            </button>
            <button className={view === "board" ? "is-active" : ""} onClick={() => chooseView("board")} type="button">
              <SquaresFour size={16} /> Board
            </button>
          </div>
          <button className="nma-btn nma-btn--primary" onClick={() => setModal({ task: null, status: "open" })} type="button">
            <Plus size={18} weight="bold" /> New task
          </button>
        </div>
      </div>

      <Summary now={now} tasks={tasks} />

      {view === "board" ? (
        <div className="nma-board">
          {columns.map((c) => (
            <section
              className={`nma-col ${over === c.id ? "is-over" : ""}`}
              key={c.id}
              onDragLeave={() => setOver((o) => (o === c.id ? null : o))}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(c.id);
              }}
              onDrop={(e) => dropOn(e, c.id)}
            >
              <header className="nma-col__head">
                <span className={`nma-dot nma-dot--${c.tone}`} />
                <b>{c.label}</b>
                <small>{grouped[c.id].length}</small>
              </header>
              <div className="nma-col__body">
                {grouped[c.id].map((t) => (
                  <Card
                    dragging={dragId === t.id}
                    key={t.id}
                    onDragEnd={() => {
                      setDragId(null);
                      setOver(null);
                    }}
                    onDragStart={() => setDragId(t.id)}
                    now={now} onOpen={() => setModal({ task: t, status: t.status })} onToggleTimer={() => toggleTimer(t)} task={t} />
                ))}
                <button className="nma-col__add" onClick={() => setModal({ task: null, status: c.id })} type="button">
                  <Plus size={16} /> Add
                </button>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="nma-card">
          {tasks.length === 0 ? (
            <p className="nma-empty">No tasks yet. Click New task to add your first one.</p>
          ) : (
            <ul className="nma-tasklist">
              {columns.flatMap((c) => grouped[c.id]).map((t) => {
                const overdue = t.due_date && t.status !== "done" && t.due_date < today();
                return (
                  <li key={t.id}>
                    <button onClick={() => setModal({ task: t, status: t.status })} type="button">
                      <span className={`nma-dot nma-dot--${columns.find((c) => c.id === t.status)?.tone}`} />
                      <span className="nma-list__main">
                        <b className={t.status === "done" ? "is-done" : ""}>{t.title}</b>
                        {t.description ? <small>{t.description}</small> : null}
                      </span>
                      <span className={`nma-chip nma-chip--${t.priority}`}>{priorityText[t.priority]}</span>
                      {t.due_date ? <span className={`nma-chip ${overdue ? "nma-chip--overdue" : "nma-chip--due"}`}>{fmtDay(t.due_date)}</span> : null}
                      {t.tag ? <span className="nma-chip nma-chip--tag">{t.tag}</span> : null}
                      <span className="nma-task__time">{fmtTime(elapsed(t, now))}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {modal ? <TaskModal key={modal.task?.id ?? `new-${modal.status}`} onClose={() => setModal(null)} startStatus={modal.status} task={modal.task} /> : null}
    </>
  );
}
