"use client";

import { useState } from "react";
import { useSync } from "@/components/SyncProvider";
import { syncConfigured } from "@/lib/supabase";

export default function Account() {
  const { status, email, error, lastSynced, syncNow, signIn, signOut } = useSync();
  const [addr, setAddr] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!syncConfigured) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Account & sync</h1>
        <p>Cloud sync is not set up, so your progress is stored only in this browser. To enable it (free):</p>
        <ol className="list-decimal space-y-2 pl-6 text-sm">
          <li>Create a project at <b>supabase.com</b> (free plan).</li>
          <li>In <b>SQL Editor</b>, run the contents of <code>supabase/schema.sql</code> from the repo.</li>
          <li>In <b>Authentication → URL Configuration</b>, set the Site URL to your Vercel URL and add <code>https://YOUR-APP.vercel.app/account</code> (and <code>http://localhost:3000/account</code> for local dev) to the Redirect URLs.</li>
          <li>In <b>Project Settings → API</b>, copy the Project URL and the <b>anon public</b> key.</li>
          <li>In Vercel → Project → Settings → Environment Variables, add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then redeploy. (Locally: copy <code>.env.example</code> to <code>.env.local</code>.)</li>
        </ol>
        <p className="text-sm text-muted">The anon key is designed to be public; row-level security in the SQL file ensures each user can only read and write their own row.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Account & sync</h1>
      {email ? (
        <div className="space-y-3 rounded-xl border border-line bg-card p-4">
          <p>Signed in as <b>{email}</b></p>
          <p className="text-sm text-muted">
            Status: {status}{lastSynced ? ` · last synced ${lastSynced.toLocaleTimeString()}` : ""}
          </p>
          {error && <p className="text-sm text-accent">Error: {error}</p>}
          <div className="flex gap-2">
            <button onClick={() => void syncNow()} className="rounded-full bg-accent px-4 py-1.5 text-white">Sync now</button>
            <button onClick={() => void signOut()} className="rounded-full border border-line px-4 py-1.5">Sign out</button>
          </div>
          <p className="text-xs text-muted">On first sign-in your existing local progress is merged with anything already in your account, so nothing is lost.</p>
        </div>
      ) : (
        <form
          className="space-y-3 rounded-xl border border-line bg-card p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const err = await signIn(addr.trim());
            setMsg(err);
            setSent(!err);
          }}
        >
          <p className="text-sm text-muted">Enter your email and we&apos;ll send you a sign-in link – no password needed.</p>
          <input type="email" required value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="you@example.com" className="w-full rounded-lg border border-line bg-bg px-3 py-2" />
          <button className="rounded-full bg-accent px-5 py-2 text-white">Send sign-in link</button>
          {sent && <p className="text-sm text-good">Check your inbox and open the link on this device.</p>}
          {msg && <p className="text-sm text-accent">{msg}</p>}
        </form>
      )}
    </div>
  );
}
