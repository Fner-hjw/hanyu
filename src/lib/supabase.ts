"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** null when Supabase isn't configured – the app then stays purely local. */
export function getSupabase(): SupabaseClient | null {
  if (!url || !key) return null;
  client ??= createClient(url, key);
  return client;
}

export const syncConfigured = Boolean(url && key);

/** Free sign-in providers the app offers; each shows only when enabled in Supabase ("azure" is Microsoft). */
export const OAUTH_PROVIDERS = ["google", "github", "azure"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];
export type AuthSettings = {
  /** which sign-in methods are switched on in the Supabase dashboard */
  google: boolean;
  github: boolean;
  azure: boolean;
  email: boolean;
  /** "Confirm email" is off: new password accounts work immediately, no email sent */
  autoconfirm: boolean;
  signupDisabled: boolean;
};

/** Reads the project's public auth settings so the UI only offers methods that are enabled. */
export async function getAuthSettings(): Promise<AuthSettings | null> {
  if (!url || !key) return null;
  try {
    const r = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
    if (!r.ok) return null;
    const j = (await r.json()) as { external?: Record<string, boolean>; mailer_autoconfirm?: boolean; disable_signup?: boolean };
    return {
      google: !!j.external?.google,
      github: !!j.external?.github,
      azure: !!j.external?.azure,
      email: j.external?.email !== false,
      autoconfirm: !!j.mailer_autoconfirm,
      signupDisabled: !!j.disable_signup,
    };
  } catch {
    return null;
  }
}
