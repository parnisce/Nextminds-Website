import { ArrowLeft, Eye, EyeSlash, LockKey, ShieldCheck } from "@phosphor-icons/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { supabase } from "@/lib/supabase";

import { signOut, useAdminAuth } from "./data";
import "./admin.css";

export function LoginPage() {
  const auth = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in as an admin: go straight to the dashboard.
  useEffect(() => {
    if (auth.status === "in") void navigate({ to: "/admin", replace: true });
  }, [auth.status, navigate]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase().auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) {
      setError(err.message === "Invalid login credentials" ? "That email and password don't match." : err.message);
    }
    // On success useAdminAuth sees SIGNED_IN and the effect above redirects (or shows "no admin access").
  };

  return (
    <div className="nma-root nma-login">
      <div aria-hidden="true" className="nma-login__glow" />
      <div className="nma-login__panel">
        <aside className="nma-login__brand">
          <img alt="NextMinds" height={46} src="/assets/brand/logo.png" width={177} />
          <h2>
            Run your website <span>from one place.</span>
          </h2>
          <ul>
            <li>
              <ShieldCheck size={22} weight="duotone" /> Edit your homepage text
            </li>
            <li>
              <ShieldCheck size={22} weight="duotone" /> Publish blog posts
            </li>
            <li>
              <ShieldCheck size={22} weight="duotone" /> Answer contact enquiries
            </li>
          </ul>
        </aside>

        <form className="nma-login__form" onSubmit={onSubmit}>
          <span className="nma-login__icon">
            <LockKey size={26} weight="duotone" />
          </span>
          <h1>Admin sign in</h1>
          <p>Use the account you set up for this site.</p>

          {auth.status === "denied" ? (
            <div className="nma-alert" role="alert">
              <b>{auth.email}</b> is signed in but isn&rsquo;t an admin.{" "}
              <button className="nma-link" onClick={() => void signOut()} type="button">
                Sign out
              </button>
            </div>
          ) : null}

          <label className="nma-field">
            <span>Email</span>
            <input autoComplete="username" onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required type="email" value={email} />
          </label>
          <label className="nma-field">
            <span>Password</span>
            <div className="nma-pw">
              <input autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required type={show ? "text" : "password"} value={password} />
              <button aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)} type="button">
                {show ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error ? (
            <p className="nma-formerror" role="alert">
              {error}
            </p>
          ) : null}

          <button className="nma-btn nma-btn--primary nma-btn--block" disabled={busy} type="submit">
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <Link className="nma-login__back" to="/">
            <ArrowLeft size={16} /> Back to website
          </Link>
        </form>
      </div>
    </div>
  );
}
