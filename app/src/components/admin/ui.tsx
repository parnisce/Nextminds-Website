import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import type { EnquiryStatus } from "./data";

// ── Toasts ──────────────────────────────────────────────────────────────────
type Toast = { id: number; text: string; tone: "ok" | "err" };
const ToastCtx = createContext<(text: string, tone?: "ok" | "err") => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(1);
  const push = useCallback((text: string, tone: "ok" | "err" = "ok") => {
    const id = next.current++;
    setToasts((t) => [...t, { id, text, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" className="nma-toasts">
        {toasts.map((t) => (
          <div className={`nma-toast nma-toast--${t.tone}`} key={t.id} role="status">
            {t.tone === "ok" ? <CheckCircle size={20} weight="fill" /> : <WarningCircle size={20} weight="fill" />}
            <span>{t.text}</span>
            <button aria-label="Dismiss" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} type="button">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ── Small building blocks ───────────────────────────────────────────────────
export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="nma-pagehead">
      <div>
        <h1>{title}</h1>
        {sub ? <p>{sub}</p> : null}
      </div>
      {actions ? <div className="nma-pagehead__actions">{actions}</div> : null}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="nma-field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export const statusLabel: Record<EnquiryStatus, string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
  archived: "Archived",
};

export function StatusPill({ status }: { status: EnquiryStatus | "draft" | "published" }) {
  const text = status === "draft" ? "Draft" : status === "published" ? "Published" : statusLabel[status];
  return <span className={`nma-pill nma-pill--${status}`}>{text}</span>;
}

export function Confirm({
  open,
  title,
  text,
  action,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  text: string;
  action: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="nma-modal" onClick={onCancel} role="presentation">
      <div aria-modal="true" className="nma-modal__card" onClick={(e) => e.stopPropagation()} role="alertdialog">
        <h3>{title}</h3>
        <p>{text}</p>
        <div className="nma-modal__actions">
          <button className="nma-btn" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="nma-btn nma-btn--danger" onClick={onConfirm} type="button">
            {action}
          </button>
        </div>
      </div>
    </div>
  );
}

export const timeAgo = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("") || "?";
