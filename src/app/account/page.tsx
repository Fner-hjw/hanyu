"use client";

import { useRef, useState } from "react";
import { Cloud, HardDrive, KeyRound, Mail } from "lucide-react";
import { useSync } from "@/components/SyncProvider";
import { PageHeader, Badge } from "@/components/ui";
import { useAsync } from "@/lib/data";
import { getAuthSettings, syncConfigured, type AuthSettings, type OAuthProvider } from "@/lib/supabase";
import { exportData, importData, resetData, todayKey, useAppState, useHydrated } from "@/lib/store";

export default function Account() {
  const { email, recovery } = useSync();
  const settings = useAsync(getAuthSettings, []);
  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Account & sync" subtitle="Your progress is always saved on this device. Sign in to back it up and use it on your other devices." />
      <Storage />
      {!syncConfigured ? <Setup /> : recovery ? <NewPassword /> : email ? <SignedIn /> : <SignInCard settings={settings.data} loading={settings.loading} />}
      <Backup />
      {syncConfigured && <OwnerNotes settings={settings.data} />}
    </div>
  );
}

/* ---------- where the data lives ---------- */
function Storage() {
  const s = useAppState();
  const hydrated = useHydrated();
  const { status, email, lastSynced } = useSync();
  const cards = hydrated ? Object.keys(s.cards).length : 0;
  const days = hydrated ? Object.keys(s.log).length : 0;
  const cloud = !syncConfigured ? "Not set up" : !email ? "Not signed in" : status === "error" ? "Sync error" : status === "syncing" ? "Syncing…" : "Up to date";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="card flex gap-3 p-4">
        <HardDrive size={20} className="mt-0.5 shrink-0 text-good" />
        <div className="min-w-0">
          <div className="font-semibold">This device</div>
          <p className="text-sm text-muted">Saved automatically in this browser: {cards} cards, {days} study days. Works without an account.</p>
        </div>
      </div>
      <div className="card flex gap-3 p-4">
        <Cloud size={20} className={`mt-0.5 shrink-0 ${email && status !== "error" ? "text-sky" : "text-muted"}`} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-semibold">Cloud <Badge tone={email && status !== "error" ? "sky" : "muted"}>{cloud}</Badge></div>
          <p className="text-sm text-muted">
            {email
              ? `A copy is kept in your Supabase account${lastSynced ? `, last synced ${lastSynced.toLocaleTimeString()}` : ""}.`
              : "Sign in and your progress is copied to your Supabase database and merged across devices."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- sign in / create account ---------- */
type Mode = "signin" | "signup" | "link" | "forgot";

function SignInCard({ settings, loading }: { settings: AuthSettings | null; loading: boolean }) {
  const { signIn, signInPassword, signUp, signInOAuth, resetPassword } = useSync();
  const [mode, setMode] = useState<Mode>("signin");
  const [addr, setAddr] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const oauth = (["google", "github"] as OAuthProvider[]).filter((p) => settings?.[p]);
  const emailOn = settings?.email !== false;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const a = addr.trim();
    let out: { ok: boolean; text: string } | null = null;
    if (mode === "signin") {
      const err = await signInPassword(a, pw);
      if (err) out = { ok: false, text: err === "Invalid login credentials" ? "Wrong email or password." : err };
    } else if (mode === "signup") {
      const r = await signUp(a, pw);
      out = r.error ? { ok: false, text: r.error } : r.confirm ? { ok: true, text: "Account created. Open the confirmation email, then sign in." } : null;
    } else if (mode === "link") {
      const err = await signIn(a);
      out = err ? { ok: false, text: err } : { ok: true, text: "Check your inbox and open the link on this device." };
    } else {
      const err = await resetPassword(a);
      out = err ? { ok: false, text: err } : { ok: true, text: "If that email has an account, a reset link is on its way." };
    }
    setMsg(out);
    setBusy(false);
  };

  const tabs: [Mode, string][] = [["signin", "Sign in"], ["signup", "Create account"], ["link", "Email link"]];
  const needsPw = mode === "signin" || mode === "signup";

  return (
    <div className="card space-y-4 p-5">
      {oauth.length > 0 && (
        <div className="space-y-2">
          {oauth.map((p) => (
            <button key={p} type="button" className="btn w-full justify-center gap-2" disabled={busy}
              onClick={async () => { setBusy(true); const err = await signInOAuth(p); if (err) { setMsg({ ok: false, text: err }); setBusy(false); } }}>
              {p === "google" ? <GoogleMark /> : <GitHubMark />} Continue with {p === "google" ? "Google" : "GitHub"}
            </button>
          ))}
          {emailOn && <div className="flex items-center gap-3 pt-1 text-xs text-muted"><span className="h-px flex-1 bg-line" />or use email<span className="h-px flex-1 bg-line" /></div>}
        </div>
      )}

      {emailOn && (
        <>
          {mode !== "forgot" && (
            <div className="flex flex-wrap gap-1.5" role="tablist">
              {tabs.map(([m, label]) => (
                <button key={m} type="button" role="tab" aria-selected={mode === m} data-active={mode === m} className="chip"
                  onClick={() => { setMode(m); setMsg(null); }}>{label}</button>
              ))}
            </div>
          )}
          <form className="space-y-3" onSubmit={submit}>
            {mode === "forgot" && <p className="text-sm font-semibold">Reset your password</p>}
            <label className="block">
              <span className="eyebrow">Email</span>
              <input type="email" required autoComplete="email" value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="you@example.com" className="input mt-1" />
            </label>
            {needsPw && (
              <label className="block">
                <span className="eyebrow">Password</span>
                <input type="password" required minLength={mode === "signup" ? 8 : 1} autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={pw} onChange={(e) => setPw(e.target.value)} placeholder={mode === "signup" ? "At least 8 characters" : ""} className="input mt-1" />
              </label>
            )}
            <button className="btn btn-primary w-full justify-center" disabled={busy}>
              {busy ? "Please wait…" : { signin: "Sign in", signup: "Create account", link: "Send sign-in link", forgot: "Send reset link" }[mode]}
            </button>
            {msg && <p className={`text-sm ${msg.ok ? "text-good" : "text-accent"}`} role="status">{msg.text}</p>}
            <p className="text-xs text-muted">
              {mode === "signin" && <button type="button" className="font-semibold text-accent" onClick={() => { setMode("forgot"); setMsg(null); }}>Forgot password?</button>}
              {mode === "signup" && (settings?.signupDisabled
                ? "New sign-ups are switched off for this app."
                : settings?.autoconfirm
                  ? "You'll be signed in straight away; no email is sent."
                  : "Supabase will email you a link to confirm the address.")}
              {mode === "link" && "No password: we email you a one-time link. Useful on a new device."}
              {mode === "forgot" && <button type="button" className="font-semibold text-accent" onClick={() => { setMode("signin"); setMsg(null); }}>Back to sign in</button>}
            </p>
          </form>
        </>
      )}
      {!loading && !emailOn && oauth.length === 0 && <p className="text-sm text-muted">No sign-in methods are enabled in Supabase yet.</p>}
      <p className="text-xs text-muted">Signing in merges what&apos;s on this device with your account, so nothing is lost.</p>
    </div>
  );
}

function NewPassword() {
  const { updatePassword } = useSync();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form className="card space-y-3 p-5" onSubmit={async (e) => { e.preventDefault(); setMsg(await updatePassword(pw)); }}>
      <div className="flex items-center gap-2 font-semibold"><KeyRound size={18} /> Choose a new password</div>
      <input type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" className="input" />
      <button className="btn btn-primary">Save password</button>
      {msg && <p className="text-sm text-accent">{msg}</p>}
    </form>
  );
}

function SignedIn() {
  const { status, email, error, provider, syncNow, signOut, updatePassword } = useSync();
  const [pw, setPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const label = provider === "google" ? "Google" : provider === "github" ? "GitHub" : "email";
  return (
    <div className="card space-y-4 p-5">
      <div>
        <p>Signed in as <b>{email}</b> <Badge>{label}</Badge></p>
        {error && <p className="mt-1 text-sm text-accent">Sync error: {error}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => void syncNow()} className="btn btn-primary" disabled={status === "syncing"}>{status === "syncing" ? "Syncing…" : "Sync now"}</button>
        <button onClick={() => void signOut()} className="btn">Sign out</button>
      </div>
      <p className="text-xs text-muted">Signing out keeps your progress on this device.</p>
      {provider === "email" && (
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold">Change password</summary>
          <form className="mt-3 flex flex-wrap gap-2" onSubmit={async (e) => {
            e.preventDefault();
            const err = await updatePassword(pw);
            setPwMsg(err ? { ok: false, text: err } : { ok: true, text: "Password updated." });
            if (!err) setPw("");
          }}>
            <input type="password" required minLength={8} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" className="input min-w-0 flex-1" />
            <button className="btn">Save</button>
          </form>
          {pwMsg && <p className={`mt-2 ${pwMsg.ok ? "text-good" : "text-accent"}`}>{pwMsg.text}</p>}
        </details>
      )}
    </div>
  );
}

/* ---------- backup ---------- */
function Backup() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [arm, setArm] = useState(false);
  return (
    <div className="card p-5">
      <div className="font-semibold">Backup file</div>
      <p className="mt-1 text-sm text-muted">Download everything as a file, or load a file on another browser. Works without an account.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn btn-sm" onClick={() => {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(new Blob([exportData()], { type: "application/json" }));
          a.download = `hanyu-backup-${todayKey()}.json`;
          a.click();
          URL.revokeObjectURL(a.href);
        }}>Download backup</button>
        <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>Restore from file</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          try { importData(await f.text()); setMsg({ ok: true, text: "Backup restored." }); } catch { setMsg({ ok: false, text: "That file isn't a valid Hànyǔ backup." }); }
        }} />
        <button className="btn btn-sm text-accent" onClick={() => { if (arm) { resetData(); setArm(false); setMsg({ ok: true, text: "Progress on this device was deleted." }); } else setArm(true); }}
          onBlur={() => setArm(false)}>
          {arm ? "Click again to delete" : "Reset this device"}
        </button>
      </div>
      {msg && <p className={`mt-2 text-sm ${msg.ok ? "text-good" : "text-accent"}`} role="status">{msg.text}</p>}
    </div>
  );
}

/* ---------- setup help ---------- */
function Setup() {
  return (
    <div className="card space-y-3 p-5 text-sm">
      <div className="font-semibold">Cloud sync isn&apos;t set up for this site</div>
      <ol className="list-decimal space-y-2 pl-5">
        <li>Create a free project at <b>supabase.com</b>.</li>
        <li>In <b>SQL Editor</b>, run <code>supabase/schema.sql</code> from the repo.</li>
        <li>In <b>Authentication → URL Configuration</b>, set the Site URL to your Vercel URL and add <code>https://YOUR-APP.vercel.app/account</code> to the Redirect URLs.</li>
        <li>In <b>Project Settings → API Keys</b>, copy the Project URL and the <b>publishable</b> (or anon) key.</li>
        <li>In Vercel → Settings → Environment Variables, add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then redeploy. Locally, copy <code>.env.example</code> to <code>.env.local</code>.</li>
      </ol>
    </div>
  );
}

function OwnerNotes({ settings }: { settings: AuthSettings | null }) {
  return (
    <details className="card-flat p-4 text-sm">
      <summary className="cursor-pointer font-semibold"><Mail size={15} className="mr-1.5 inline" />For the site owner: sign-in without an email server</summary>
      <div className="mt-3 space-y-2 text-muted">
        <p>Supabase&apos;s built-in mailer only sends a few emails per hour, and only to your project team&apos;s addresses. To avoid needing email at all:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><b>Passwords, no email:</b> Authentication → Sign In / Providers → Email → turn off <b>Confirm email</b>. {settings && <Badge tone={settings.autoconfirm ? "good" : "muted"}>{settings.autoconfirm ? "on" : "currently required"}</Badge>}</li>
          <li><b>GitHub:</b> create an OAuth app at github.com/settings/developers with callback <code>https://YOUR-PROJECT.supabase.co/auth/v1/callback</code>, then paste its ID and secret under Providers → GitHub. {settings && <Badge tone={settings.github ? "good" : "muted"}>{settings.github ? "on" : "off"}</Badge>}</li>
          <li><b>Google:</b> create an OAuth client in Google Cloud Console (same callback URL), then Providers → Google. {settings && <Badge tone={settings.google ? "good" : "muted"}>{settings.google ? "on" : "off"}</Badge>}</li>
          <li><b>Private app:</b> after creating your own account, turn off <b>Allow new users to sign up</b> so nobody else can register.</li>
          <li>For password resets and email links to anyone, connect a free SMTP service (e.g. Resend) under Authentication → Emails → SMTP.</li>
        </ul>
        <p>Your progress is stored in <b>Table Editor → progress</b>: one row per user, with all data in the <code>data</code> column.</p>
      </div>
    </details>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.8 6C12.3 13.6 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.4 5.7c4.3-4 6.9-9.9 6.9-17.2z" />
      <path fill="#FBBC05" d="M10.4 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.8-6A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.8-6z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.4 0-11.7-4.1-13.6-9.8l-7.8 6C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}
function GitHubMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.6 0 0 3.6 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.6 7.6 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.6 3.9.3.3.5.8.5 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 16 8c0-4.4-3.6-8-8-8z" />
    </svg>
  );
}
