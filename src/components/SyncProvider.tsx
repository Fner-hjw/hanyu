"use client";

import type { Session } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getSupabase, syncConfigured, type OAuthProvider } from "@/lib/supabase";
import { fingerprint, mergeStates } from "@/lib/merge";
import { DEFAULT_STATE, getState, replaceState, useAppState, type AppState } from "@/lib/store";

type Status = "off" | "signed-out" | "idle" | "syncing" | "synced" | "offline" | "error";
type Ctx = {
  status: Status;
  email: string | null;
  error: string | null;
  lastSynced: Date | null;
  syncNow: () => Promise<void>;
  /** how the current user signed in, e.g. "email", "google", "github" */
  provider: string | null;
  /** true after opening a password-reset link: the account page asks for a new password */
  recovery: boolean;
  /** each returns an error message, or null on success */
  signIn: (email: string) => Promise<string | null>;
  signInPassword: (email: string, password: string) => Promise<string | null>;
  /** null = signed in straight away; "confirm" = Supabase sent a confirmation email */
  signUp: (email: string, password: string) => Promise<{ error: string | null; confirm: boolean }>;
  signInOAuth: (provider: OAuthProvider) => Promise<string | null>;
  /** null on success or when the person cancels the browser prompt */
  signInPasskey: () => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  resendConfirmation: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const NOT_SET = "Sync is not configured";

/** Turns a passkey error into a message; closing the browser prompt is not an error. */
export function passkeyError(e: Error & { code?: string; cause?: unknown }): string | null {
  const cause = e.cause instanceof Error ? e.cause.name : "";
  if (e.code === "ERROR_CEREMONY_ABORTED" || e.name === "NotAllowedError" || cause === "NotAllowedError") return null;
  if (e.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED") return "This device already has a passkey for your account.";
  return e.message;
}

const SyncCtx = createContext<Ctx>({
  status: "off", email: null, error: null, lastSynced: null,
  provider: null, recovery: false, syncNow: async () => {},
  signIn: async () => NOT_SET, signInPassword: async () => NOT_SET, signUp: async () => ({ error: NOT_SET, confirm: false }),
  signInOAuth: async () => NOT_SET, signInPasskey: async () => NOT_SET, resetPassword: async () => NOT_SET, resendConfirmation: async () => NOT_SET, updatePassword: async () => NOT_SET, signOut: async () => {},
});
const back = () => `${window.location.origin}/account`;
export const useSync = () => useContext(SyncCtx);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const sb = getSupabase();
  const app = useAppState();
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [recovery, setRecovery] = useState(false);
  const [status, setStatus] = useState<Status>(syncConfigured ? "signed-out" : "off");
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const busy = useRef(false);
  const again = useRef(false);

  // auth session
  useEffect(() => {
    if (!sb) return;
    const apply = (session: Session | null) => {
      setUid(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
      setProvider((session?.user.app_metadata?.provider as string | undefined) ?? null);
      if (!session) { setStatus("signed-out"); setRecovery(false); }
    };
    sb.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      apply(session);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  const sync = useCallback(async () => {
    if (!sb || !uid) return;
    if (!navigator.onLine) { setStatus("offline"); return; }
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
    const onOnline = () => void sync();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOnline); // marks the status as offline
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOnline);
    };
  }, [uid, sync]);

  const signIn = useCallback(async (addr: string) => {
    if (!sb) return NOT_SET;
    const { error: e } = await sb.auth.signInWithOtp({ email: addr, options: { emailRedirectTo: back() } });
    return e ? e.message : null;
  }, [sb]);
  const signInPassword = useCallback(async (addr: string, password: string) => {
    if (!sb) return NOT_SET;
    const { error: e } = await sb.auth.signInWithPassword({ email: addr, password });
    return e ? e.message : null;
  }, [sb]);
  const signUp = useCallback(async (addr: string, password: string) => {
    if (!sb) return { error: NOT_SET, confirm: false };
    const { data, error: e } = await sb.auth.signUp({ email: addr, password, options: { emailRedirectTo: back() } });
    if (e) return { error: e.message, confirm: false };
    // Supabase answers an already-registered address with a user that has no identities (to avoid leaking accounts)
    if (data.user && !data.user.identities?.length) return { error: "That email already has an account – sign in instead.", confirm: false };
    return { error: null, confirm: !data.session };
  }, [sb]);
  const signInOAuth = useCallback(async (p: OAuthProvider) => {
    if (!sb) return NOT_SET;
    const { error: e } = await sb.auth.signInWithOAuth({ provider: p, options: { redirectTo: back(), ...(p === "azure" && { scopes: "email" }) } });
    return e ? e.message : null;
  }, [sb]);
  const signInPasskey = useCallback(async () => {
    if (!sb) return NOT_SET;
    const { error: e } = await sb.auth.signInWithPasskey();
    return e ? passkeyError(e) : null;
  }, [sb]);
  const resetPassword = useCallback(async (addr: string) => {
    if (!sb) return NOT_SET;
    const { error: e } = await sb.auth.resetPasswordForEmail(addr, { redirectTo: back() });
    return e ? e.message : null;
  }, [sb]);
  const resendConfirmation = useCallback(async (addr: string) => {
    if (!sb) return NOT_SET;
    const { error: e } = await sb.auth.resend({ type: "signup", email: addr, options: { emailRedirectTo: back() } });
    return e ? e.message : null;
  }, [sb]);
  const updatePassword = useCallback(async (password: string) => {
    if (!sb) return NOT_SET;
    const { error: e } = await sb.auth.updateUser({ password });
    if (!e) setRecovery(false);
    return e ? e.message : null;
  }, [sb]);
  const signOut = useCallback(async () => { await sb?.auth.signOut(); }, [sb]);

  return (
    <SyncCtx.Provider value={{
      status, email, error, lastSynced, provider, recovery, syncNow: sync,
      signIn, signInPassword, signUp, signInOAuth, signInPasskey, resetPassword, resendConfirmation, updatePassword, signOut,
    }}>
      {children}
    </SyncCtx.Provider>
  );
}
