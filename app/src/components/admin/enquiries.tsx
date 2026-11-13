import { Archive, ArrowBendUpLeft, DownloadSimple, EnvelopeSimple, MagnifyingGlass, Phone, Trash, Tray, X } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { type Enquiry, type EnquiryStatus, useAdminData } from "./data";
import { Confirm, PageHead, StatusPill, initials, statusLabel, timeAgo, useToast } from "./ui";

const filters: ("all" | EnquiryStatus)[] = ["all", "new", "read", "replied", "archived"];

const csvCell = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;

function exportCsv(rows: Enquiry[]) {
  const head = ["Date", "Name", "Email", "Phone", "Service", "Status", "Message"];
  const lines = rows.map((q) => [q.created_at, q.name, q.email, q.phone, q.service, q.status, q.message].map(csvCell).join(","));
  const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `nextminds-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function Detail({ q, onClose }: { q: Enquiry; onClose: () => void }) {
  const { setEnquiryStatus, deleteEnquiry } = useAdminData();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);

  const mark = async (status: EnquiryStatus) => {
    try {
      await setEnquiryStatus(q.id, status);
      toast(`Marked as ${statusLabel[status].toLowerCase()}.`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not update.", "err");
    }
  };

  const reply = `mailto:${q.email}?subject=${encodeURIComponent(`Re: your enquiry to NextMinds${q.service ? ` (${q.service})` : ""}`)}&body=${encodeURIComponent(`Hi ${q.name.split(" ")[0]},\n\nThank you for getting in touch.\n\n`)}`;

  return (
    <aside className="ad-detail ad-card">
      <header className="ad-detail__head">
        <span className="ad-avatar ad-avatar--lg">{initials(q.name)}</span>
        <div>
          <h2>{q.name}</h2>
          <p>{new Date(q.created_at).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
        <button aria-label="Close" className="ad-iconbtn" onClick={onClose} type="button">
          <X size={18} />
        </button>
      </header>

      <div className="ad-detail__meta">
        <StatusPill status={q.status} />
        {q.service ? <span className="ad-tag">{q.service}</span> : null}
      </div>

      <dl className="ad-detail__facts">
        <div>
          <dt>
            <EnvelopeSimple size={16} /> Email
          </dt>
          <dd>
            <a href={`mailto:${q.email}`}>{q.email}</a>
          </dd>
        </div>
        {q.phone ? (
          <div>
            <dt>
              <Phone size={16} /> Phone
            </dt>
            <dd>
              <a href={`tel:${q.phone}`}>{q.phone}</a>
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="ad-detail__msg">
        <small>Message</small>
        <p>{q.message}</p>
      </div>

      <div className="ad-detail__actions">
        <a className="ad-btn ad-btn--primary" href={reply} onClick={() => q.status !== "replied" && void mark("replied")}>
          <ArrowBendUpLeft size={18} /> Reply by email
        </a>
        {q.status !== "replied" ? (
          <button className="ad-btn" onClick={() => void mark("replied")} type="button">
            Mark replied
          </button>
        ) : null}
        {q.status !== "new" ? (
          <button className="ad-btn" onClick={() => void mark("new")} type="button">
            Mark unread
          </button>
        ) : null}
        {q.status !== "archived" ? (
          <button className="ad-btn" onClick={() => void mark("archived")} type="button">
            <Archive size={16} /> Archive
          </button>
        ) : null}
        <button className="ad-btn ad-btn--ghost ad-btn--red" onClick={() => setConfirm(true)} type="button">
          <Trash size={16} /> Delete
        </button>
      </div>

      <Confirm
        action="Delete enquiry"
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          void deleteEnquiry(q.id)
            .then(() => {
              toast("Enquiry deleted.");
              onClose();
            })
            .catch((e: unknown) => toast(e instanceof Error ? e.message : "Could not delete.", "err"));
        }}
        open={confirm}
        text={`This permanently deletes the message from ${q.name}. Archive it instead if you want to keep a record.`}
        title="Delete this enquiry?"
      />
    </aside>
  );
}

export function EnquiriesPage({ id }: { id?: string }) {
  const { enquiries, loading, setEnquiryStatus } = useAdminData();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | EnquiryStatus>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: enquiries.length };
    for (const e of enquiries) c[e.status] = (c[e.status] ?? 0) + 1;
    return c;
  }, [enquiries]);

  const shown = useMemo(
    () =>
      enquiries.filter(
        (e) =>
          (filter === "all" ? e.status !== "archived" : e.status === filter) &&
          (!q || `${e.name} ${e.email} ${e.service ?? ""} ${e.message}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [enquiries, filter, q],
  );

  const selected = id ? (enquiries.find((e) => e.id === id) ?? null) : null;

  // Opening an unread enquiry marks it as read.
  useEffect(() => {
    if (selected?.status === "new") void setEnquiryStatus(selected.id, "read").catch(() => {});
  }, [selected?.id, selected?.status, setEnquiryStatus]);

  const open = (eid?: string) => void navigate({ to: "/admin/enquiries", search: eid ? { id: eid } : {} });

  return (
    <>
      <PageHead
        actions={
          <button className="ad-btn" disabled={enquiries.length === 0} onClick={() => exportCsv(enquiries)} type="button">
            <DownloadSimple size={18} /> Export CSV
          </button>
        }
        sub="Messages sent from your Contact Us page."
        title="Enquiries"
      />

      <div className={`ad-split ${selected ? "has-detail" : ""}`}>
        <div className="ad-card ad-split__list">
          <div className="ad-toolbar">
            <label className="ad-search">
              <MagnifyingGlass size={18} />
              <input onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or message" value={q} />
            </label>
            <div className="ad-chips">
              {filters.map((f) => (
                <button className={filter === f ? "is-active" : ""} key={f} onClick={() => setFilter(f)} type="button">
                  {f === "all" ? "Inbox" : statusLabel[f]}
                  <b>{f === "all" ? (counts.all ?? 0) - (counts.archived ?? 0) : (counts[f] ?? 0)}</b>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="ad-empty">Loading…</p>
          ) : shown.length === 0 ? (
            <div className="ad-empty ad-empty--big">
              <Tray size={44} weight="duotone" />
              <p>{enquiries.length === 0 ? "No enquiries yet. Messages from your Contact page will land here." : "Nothing matches this view."}</p>
            </div>
          ) : (
            <ul className="ad-inbox">
              {shown.map((e) => (
                <li className={`${e.id === id ? "is-selected" : ""} ${e.status === "new" ? "is-new" : ""}`} key={e.id}>
                  <button onClick={() => open(e.id)} type="button">
                    <span className="ad-avatar">{initials(e.name)}</span>
                    <span className="ad-list__main">
                      <b>{e.name}</b>
                      <small>{e.message}</small>
                    </span>
                    <span className="ad-inbox__side">
                      <time>{timeAgo(e.created_at)}</time>
                      {e.service ? <em>{e.service}</em> : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selected ? <Detail key={selected.id} onClose={() => open()} q={selected} /> : null}
      </div>
    </>
  );
}
