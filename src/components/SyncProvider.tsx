"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getSupabase, syncConfigured } from "@/lib/supabase";
import { fingerprint, mergeStates } from "@/lib/merge";
import { DEFAULT_STATE, getState, replaceState, useAppState, type AppState } from "@/lib/store";

type Status = "off" | "signed-out" | "idle" | "syncing" | "synced" | "error";
type Ctx = {
  status: Status;
  email: string | null;
  error: string | null;
  lastSynced: Date | null;
  syncNow: () => Promise<void>;
  signIn: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const SyncCtx = createContext<Ctx>({
  status: "off", email: null, error: null, lastSynced: null,
  syncNow: async () => {}, signIn: async () => "Sync not configured", signOut: async () => {},
});
export const useSync = () => useContext(SyncCtx);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const sb = getSupabase();
  const app = useAppState();
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(syncConfigured ? "signed-out" : "off");
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const busy = useRef(false);
  const again = useRef(false);

  // auth session
  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      setUid(data.session?.user.id ?? null);
      setEmail(data.session?.user.email ?? null);
      if (!data.session) setStatus("signed-out");
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setUid(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
      if (!session) setStatus("signed-out");
    });
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  const sync = useCallback(async () => {
    if (!sb || !uid) return;
    if (busy.current) { again.current = true; return; }
    busy.current = true;
    setStatus("syncing");
    try {
      do {
        again.current = false;
        const { data, error: e } = await sb.from("progress").select("data").eq("user_id", uid).maybeSingle();
        if (e) throw e;
        const local = getState();
        const remote: AppState | null = data?.data ? ({ ...DEFAULT_STATE, ...data.data } as AppState) : null;
        const merged = remote ? mergeStates(local, remote) : local;
        if (fingerprint(merged) !== fingerprint(local)) replaceState(merged);
        if (!remote || fingerprint(merged) !== fingerprint(remote)) {
          const { error: ue } = await sb.from("progress").upsert({ user_id: uid, data: merged, updated_at: new Date().toISOString() });
          if (ue) throw ue;
        }
      } while (again.current);
      setError(null);
      setLastSynced(new Date());
      setStatus("synced");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    } finally {
      busy.current = false;
    }
  }, [sb, uid]);

  // sync on login, shortly after local changes, and when the tab regains focus
  useEffect(() => {
    if (!uid) return;
    const id = setTimeout(() => void sync(), 0);
    return () => clearTimeout(id);
  }, [uid, sync]);
  useEffect(() => {
    if (!uid) return;
    const id = setTimeout(() => void sync(), 4000);
    return () => clearTimeout(id);
  }, [app, uid, sync]);
  useEffect(() => {
    if (!uid) return;
    const onVis = () => document.visibilityState === "visible" && void sync();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [uid, sync]);

  const signIn = useCallback(async (addr: string) => {
    if (!sb) return "Sync is not configured";
    const { error: e } = await sb.auth.signInWithOtp({ email: addr, options: { emailRedirectTo: `${window.location.origin}/account` } });
    return e ? e.message : null;
  }, [sb]);
  const signOut = useCallback(async () => { await sb?.auth.signOut(); }, [sb]);

  return (
    <SyncCtx.Provider value={{ status, email, error, lastSynced, syncNow: sync, signIn, signOut }}>
      {children}
    </SyncCtx.Provider>
  );
}
