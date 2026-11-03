"use client";

import { useRef, useState } from "react";
import { Cloud, Download, HardDrive, KeyRound, WifiOff } from "lucide-react";
import { useSync } from "@/components/SyncProvider";
import { AiSettings } from "@/components/AiSettings";
import { PageHeader, Badge, Progress } from "@/components/ui";
import { useAsync, levelLabel } from "@/lib/data";
import { clearOffline, downloadForOffline, offlineStatus, offlineSupported } from "@/lib/offline";
import { getAuthSettings, OAUTH_PROVIDERS, syncConfigured, type AuthSettings, type OAuthProvider } from "@/lib/supabase";
import { exportData, importData, resetData, todayKey, useAppState, useHydrated } from "@/lib/store";

export default function Account() {
  const { email, recovery } = useSync();
  const settings = useAsync(getAuthSettings, []);
  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Account & sync" subtitle="Your progress is always saved on this device. Sign in to back it up and use it on your other devices." />
      <Storage />
      {!syncConfigured ? <Setup /> : recovery ? <NewPassword /> : email ? <SignedIn /> : <SignInCard settings={settings.data} loading={settings.loading} />}
      <AiSettings />
      <Offline />
      <Backup />
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
const PROVIDER_NAME: Record<OAuthProvider, string> = { google: "Google", github: "GitHub", azure: "Microsoft" };

function SignInCard({ settings, loading }: { settings: AuthSettings | null; loading: boolean }) {
  const { signInOAuth } = useSync();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const providers = OAUTH_PROVIDERS.filter((p) => settings?.[p]);

  return (
    <div className="card space-y-4 p-5">
      {providers.length > 0 && (
        <div className="space-y-2">
          {providers.map((p) => (
            <button key={p} type="button" className="btn w-full justify-center gap-2" disabled={busy}
              onClick={async () => { setBusy(true); setErr(null); const e = await signInOAuth(p); if (e) { setErr(e); setBusy(false); } }}>
              {p === "google" ? <GoogleMark /> : p === "github" ? <GitHubMark /> : <MicrosoftMark />} Continue with {PROVIDER_NAME[p]}
            </button>
          ))}
        </div>
      )}
      {err && <p className="text-sm text-accent" role="status">{err}</p>}
      {loading && <p className="text-sm text-muted">Loading sign-in options…</p>}
      {!loading && providers.length === 0 && <p className="text-sm text-muted">Sign-in isn&apos;t available right now. Your progress is still saved on this device.</p>}
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
  const label = provider && provider in PROVIDER_NAME ? PROVIDER_NAME[provider as OAuthProvider] : "email";
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

/* ---------- offline ---------- */
function Offline() {
  const s = useAppState();
  const hydrated = useHydrated();
  const [tick, setTick] = useState(0);
  const status = useAsync(offlineStatus, [tick]);
  const deckLevel = /^hsk-(\d)$/.exec(s.settings.deck)?.[1];
  const [levels, setLevels] = useState<number[] | null>(null);
  const chosen = levels ?? [deckLevel ? +deckLevel : Math.max(1, s.settings.targetLevel - 1)];
  const [dict, setDict] = useState(true);
  const [prog, setProg] = useState<{ done: number; total: number } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const st = status.data;
  if (!hydrated) return null;
  if (!offlineSupported()) {
    return <div className="card p-5 text-sm text-muted">This browser doesn&apos;t support offline mode.</div>;
  }
  const busy = !!prog && prog.done < prog.total;
  return (
    <div className="card space-y-3 p-5">
      <div className="flex flex-wrap items-center gap-2 font-semibold">
        <WifiOff size={18} /> Offline
        {st && <Badge tone={st.active ? "good" : "muted"}>{st.active ? "on" : "starting"}</Badge>}
      </div>
      <p className="text-sm text-muted">
        Pages and audio you use are saved automatically, so they work without internet next time. Download the rest ahead of a trip.
      </p>
      {st && (
        <p className="text-sm">
          Saved now: <b>{st.pages}</b> pages, <b>{st.dataFiles}</b> data files, <b>{st.audio}</b> audio {st.audio === 1 ? "clip" : "clips"} · {st.usageMB} MB used
          {st.persisted && <span className="text-muted"> · protected from automatic cleanup</span>}
        </p>
      )}
      <div>
        <div className="eyebrow mb-1.5">Lesson units to include</div>
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((l) => (
            <button key={l} type="button" className="chip" data-active={chosen.includes(l)} disabled={busy}
              onClick={() => setLevels(chosen.includes(l) ? chosen.filter((x) => x !== l) : [...chosen, l].sort())}>
              {levelLabel(l)}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={dict} disabled={busy} onChange={(e) => setDict(e.target.checked)} />
        Include the full dictionary (about 8 MB)
      </label>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary btn-sm" disabled={busy} onClick={async () => {
          setMsg(null);
          try {
            const { failed } = await downloadForOffline({ levels: chosen, dict }, (done, total) => setProg({ done, total }));
            setMsg(failed ? { ok: false, text: `Done, but ${failed} files failed. Try again when the connection is better.` } : { ok: true, text: "Everything selected is now available offline." });
          } catch (e) {
            setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) });
            setProg(null);
          }
          setTick((t) => t + 1);
        }}>
          <Download size={15} /> {busy ? "Downloading…" : "Download for offline"}
        </button>
        <button className="btn btn-sm" disabled={busy} onClick={async () => {
          await clearOffline();
          setProg(null);
          setMsg({ ok: true, text: "Offline files removed. Your progress is not affected." });
          setTick((t) => t + 1);
        }}>Remove offline files</button>
      </div>
      {prog && <div className="space-y-1"><Progress value={(prog.done / Math.max(1, prog.total)) * 100} tone="good" /><p className="text-xs text-muted">{prog.done} / {prog.total} files</p></div>}
      {msg && <p className={`text-sm ${msg.ok ? "text-good" : "text-accent"}`} role="status">{msg.text}</p>}
      <p className="text-xs text-muted">Recorded sentence audio is saved as you listen. Without a saved clip, the app reads the sentence with your device&apos;s voice instead.</p>
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
function MicrosoftMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 21 21" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
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
