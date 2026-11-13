import {
  ArrowSquareOut,
  Article,
  ChartPieSlice,
  EnvelopeSimple,
  List,
  PencilRuler,
  SignOut,
  X,
} from "@phosphor-icons/react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { type AuthState, AdminDataProvider, signOut, useAdminAuth, useAdminData } from "./data";
import { ToastProvider, initials } from "./ui";
import "./admin.css";

const nav = [
  { to: "/admin", label: "Dashboard", icon: ChartPieSlice, exact: true },
  { to: "/admin/content", label: "Homepage", icon: PencilRuler },
  { to: "/admin/posts", label: "Blog posts", icon: Article },
  { to: "/admin/enquiries", label: "Enquiries", icon: EnvelopeSimple },
] as const;

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { enquiries, email } = useAdminData();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const fresh = enquiries.filter((q) => q.status === "new").length;

  return (
    <aside className={`ad-side ${open ? "is-open" : ""}`}>
      <div className="ad-side__top">
        <Link className="ad-side__logo" onClick={onClose} to="/admin">
          <img alt="NextMinds" height={40} src="/assets/brand/logo.png" width={154} />
        </Link>
        <button aria-label="Close menu" className="ad-iconbtn ad-side__close" onClick={onClose} type="button">
          <X size={20} />
        </button>
      </div>
      <p className="ad-side__label">Manage</p>
      <nav className="ad-side__nav">
        {nav.map(({ to, label, icon: Icon, ...rest }) => {
          const exact = "exact" in rest && rest.exact;
          const active = exact ? path === to || path === `${to}/` : path.startsWith(to);
          return (
            <Link className={active ? "is-active" : ""} key={to} onClick={onClose} to={to}>
              <Icon aria-hidden size={20} weight={active ? "fill" : "duotone"} />
              <span>{label}</span>
              {to === "/admin/enquiries" && fresh > 0 ? <b className="ad-badge">{fresh}</b> : null}
            </Link>
          );
        })}
      </nav>
      <div className="ad-side__foot">
        <a className="ad-side__view" href="/" rel="noreferrer" target="_blank">
          <ArrowSquareOut size={18} />
          View live site
        </a>
        <div className="ad-user">
          <span className="ad-avatar">{initials(email.split("@")[0] ?? "A")}</span>
          <span className="ad-user__id">
            <b>Admin</b>
            <small>{email}</small>
          </span>
          <button aria-label="Sign out" className="ad-iconbtn" onClick={() => void signOut()} title="Sign out" type="button">
            <SignOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function Frame() {
  const [open, setOpen] = useState(false);
  const { error } = useAdminData();
  return (
    <div className="ad-app">
      <Sidebar onClose={() => setOpen(false)} open={open} />
      {open ? <div className="ad-scrim" onClick={() => setOpen(false)} /> : null}
      <div className="ad-main">
        <header className="ad-topbar">
          <button aria-label="Open menu" className="ad-iconbtn" onClick={() => setOpen(true)} type="button">
            <List size={22} />
          </button>
          <img alt="NextMinds" height={30} src="/assets/brand/logo.png" width={115} />
        </header>
        <main className="ad-content">
          {error ? (
            <div className="ad-alert" role="alert">
              <b>Database not ready.</b> {error}
            </div>
          ) : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Gate({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="ad-gate">
      <div className="ad-gate__card">
        <img alt="NextMinds" height={44} src="/assets/brand/logo.png" width={169} />
        <h1>{title}</h1>
        <p>{text}</p>
        {children}
      </div>
    </div>
  );
}

/** Layout for every /admin page: signed-in admins get the dashboard shell, everyone else is sent to /login. */
export function AdminLayout() {
  const realAuth = useAdminAuth();
  const navigate = useNavigate();
  // Dev-only: /admin?demo previews the dashboard with sample data and no sign-in.
  const [demo] = useState(() => import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo"));
  const auth: AuthState = demo ? { status: "in", email: "demo@nextminds.com" } : realAuth;

  useEffect(() => {
    if (auth.status === "out") void navigate({ to: "/login", replace: true });
  }, [auth.status, navigate]);

  if (auth.status === "loading" || auth.status === "out") {
    return (
      <div className="ad-root">
        <Gate text="Checking your session…" title="One moment" />
      </div>
    );
  }
  if (auth.status === "denied") {
    return (
      <div className="ad-root">
        <Gate
          text={`${auth.email} is signed in, but isn't on the admin list. Add this email to the admins table in Supabase, or sign in with another account.`}
          title="No admin access"
        >
          <button className="ad-btn ad-btn--primary" onClick={() => void signOut()} type="button">
            Sign out
          </button>
        </Gate>
      </div>
    );
  }
  return (
    <div className="ad-root">
      <ToastProvider>
        <AdminDataProvider demo={demo} email={auth.email}>
          <Frame />
        </AdminDataProvider>
      </ToastProvider>
    </div>
  );
}
