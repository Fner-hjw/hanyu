"use client";

/**
 * "Bring your own key" AI connection. The learner's provider, model and API key are kept in
 * localStorage on this device only: never in the synced progress, never sent to our server.
 * Requests go straight from the browser to the provider.
 *
 * Claude goes through the official Anthropic SDK; the other providers speak the OpenAI-style
 * chat-completions protocol, so they share one small streaming client.
 *
 * "Local CLI" uses the AI command-line tools already signed in on the learner's computer (Claude Code,
 * Codex, Mistral Vibe) through a small bridge script they run themselves (public/hanyu-bridge.mjs),
 * listening on 127.0.0.1 and protected by a pairing token. Nothing goes through our server.
 */
import { useSyncExternalStore } from "react";

export type ProviderId = "gemini" | "anthropic" | "openai" | "deepseek" | "openrouter" | "ollama" | "local";
export type LocalCli = "claude" | "codex" | "vibe";
/** For "local": key is the bridge's pairing token, model is optional (empty = the CLI's own default). */
export type AiConfig = { provider: ProviderId; key: string; model: string; cli?: LocalCli; bridge?: string };
export type ChatMsg = { role: "user" | "assistant"; content: string };
export type Effort = "low" | "medium" | "high";

type Provider = {
  name: string;
  /** short badge, e.g. "free tier" */
  badge?: string;
  blurb: string;
  needsKey: boolean;
  keyUrl?: string;
  keyPlaceholder?: string;
  /** OpenAI-compatible base URL (not used for Anthropic) */
  base?: string;
  /** fixed model choices; otherwise loaded from the provider with "Test connection" */
  models?: { id: string; label: string }[];
  defaultModel: string;
  /** preferred models when picking a default from a loaded list, best first */
  prefer?: RegExp[];
};

export const PROVIDERS: Record<ProviderId, Provider> = {
  gemini: {
    name: "Google Gemini",
    badge: "free tier",
    blurb: "Free daily allowance with a Google account, no card needed. Good at Chinese.",
    needsKey: true,
    keyUrl: "https://aistudio.google.com/apikey",
    keyPlaceholder: "AIza…",
    base: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModel: "gemini-2.5-flash",
  },
  anthropic: {
    name: "Claude (Anthropic)",
    blurb: "Excellent corrections and explanations.",
    needsKey: true,
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyPlaceholder: "sk-ant-…",
    models: [
      { id: "claude-opus-5-5", label: "Claude Opus 5.5 – best quality" },
      { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 – faster, about half the price" },
      { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 – cheapest" },
    ],
    defaultModel: "claude-opus-5-5",
  },
  openai: {
    name: "OpenAI",
    blurb: "GPT models.",
    needsKey: true,
    keyUrl: "https://platform.openai.com/api-keys",
    keyPlaceholder: "sk-…",
    base: "https://api.openai.com/v1",
    defaultModel: "",
    prefer: [/^gpt-5(\.\d+)?$/, /^gpt-5/, /^gpt-4\.1$/, /^gpt-4o$/],
  },
  deepseek: {
    name: "DeepSeek",
    blurb: "Very cheap and strong in Chinese.",
    needsKey: true,
    keyUrl: "https://platform.deepseek.com/api_keys",
    keyPlaceholder: "sk-…",
    base: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    prefer: [/^deepseek-chat$/],
  },
  openrouter: {
    name: "OpenRouter",
    badge: "some free models",
    blurb: "One key for Claude, GPT, DeepSeek and many others, including some free models.",
    needsKey: true,
    keyUrl: "https://openrouter.ai/settings/keys",
    keyPlaceholder: "sk-or-…",
    base: "https://openrouter.ai/api/v1",
    defaultModel: "",
    prefer: [/^anthropic\/claude-opus-5\.5$/, /^anthropic\/claude-sonnet-5\.5$/, /^deepseek\/deepseek-chat/, /^openai\/gpt-5/],
  },
  ollama: {
    name: "Ollama (on this computer)",
    badge: "free",
    blurb: "Free, runs locally. Start Ollama with OLLAMA_ORIGINS set to this site's address.",
    needsKey: false,
    base: "http://localhost:11434/v1",
    defaultModel: "",
    prefer: [/qwen/i, /deepseek/i, /llama/i],
  },
  local: {
    name: "Local CLI (Claude Code, Codex, Vibe)",
    badge: "no API key",
    blurb: "Use the AI command-line tool already signed in on this computer, with your existing plan.",
    needsKey: true,
    keyPlaceholder: "hb_…",
    defaultModel: "",
  },
};

/* ---------- local CLI bridge ---------- */
export const LOCAL_CLIS: Record<LocalCli, { name: string; install: string; models: { id: string; label: string }[] }> = {
  claude: {
    name: "Claude Code",
    install: "npm install -g @anthropic-ai/claude-code",
    models: [
      { id: "", label: "Default (your Claude Code setting)" },
      { id: "opus", label: "Opus – best quality" },
      { id: "sonnet", label: "Sonnet – faster" },
      { id: "haiku", label: "Haiku – fastest, uses the least of your plan" },
    ],
  },
  codex: { name: "OpenAI Codex", install: "npm install -g @openai/codex", models: [{ id: "", label: "Default (your Codex setting)" }] },
  vibe: { name: "Mistral Vibe", install: "uv tool install mistral-vibe", models: [{ id: "", label: "Default (your Vibe setting)" }] },
};
export const DEFAULT_BRIDGE = "http://127.0.0.1:11435";
export type BridgeHealth = { version: number; clis: Record<LocalCli, { name: string; available: boolean; version?: string }> };

/* ---------- stored config (this device only) ---------- */
const KEY = "hanyu:ai";
const EVENT = "hanyu:ai-change";

function read(): AiConfig | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as AiConfig;
    return c && c.provider in PROVIDERS ? c : null;
  } catch {
    return null;
  }
}
let snapshot: AiConfig | null | undefined;
let snapshotRaw: string | null = null;
function getSnapshot(): AiConfig | null {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY); } catch { /* blocked storage */ }
  if (snapshot === undefined || raw !== snapshotRaw) { snapshotRaw = raw; snapshot = read(); }
  return snapshot;
}
function subscribe(cb: () => void) {
  const on = (e: Event) => { if (!(e instanceof StorageEvent) || e.key === KEY) cb(); };
  window.addEventListener("storage", on);
  window.addEventListener(EVENT, on);
  return () => { window.removeEventListener("storage", on); window.removeEventListener(EVENT, on); };
}

export function getAiConfig(): AiConfig | null {
  return typeof window === "undefined" ? null : getSnapshot();
}
export function setAiConfig(c: AiConfig | null) {
  try {
    if (c) localStorage.setItem(KEY, JSON.stringify(c));
    else localStorage.removeItem(KEY);
  } catch { /* storage blocked: the setting just won't persist */ }
  window.dispatchEvent(new Event(EVENT));
}
/** the saved config if it is complete enough to use, else null */
export function useAiConfig(): AiConfig | null {
  const c = useSyncExternalStore(subscribe, getSnapshot, () => null);
  if (c?.provider === "local") return c.key && c.cli ? c : null;
  return c && c.model && (c.key || !PROVIDERS[c.provider].needsKey) ? c : null;
}

/* ---------- errors ---------- */
export class AiError extends Error {}

/** the provider's error message, if the body has one (OpenAI-style object, or Gemini's array of them) */
async function errorText(r: Response): Promise<string> {
  try {
    const j = await r.json();
    const e = Array.isArray(j) ? j[0]?.error : j?.error;
    return typeof e === "string" ? e : e?.message ?? "";
  } catch {
    return "";
  }
}

function friendly(status: number | undefined, provider: ProviderId, fallback: string, detail = ""): AiError {
  const name = PROVIDERS[provider].name;
  // some providers (Gemini) answer a bad key with 400 rather than 401
  if (status === 401 || status === 403 || (status === 400 && /api[ _-]?key/i.test(detail))) return new AiError(`${name} rejected the API key. Check it under Account → AI assistant.`);
  if (status === 402) return new AiError(`Your ${name} account is out of credit.`);
  if (status === 404) return new AiError(`${name} doesn't know that model. Pick another under Account → AI assistant.`);
  if (status === 429) return new AiError(`${name} is rate-limiting requests or your credit ran out. Wait a moment and try again.`);
  if (status && status >= 500) return new AiError(`${name} is having problems right now. Try again shortly.`);
  return new AiError(fallback);
}
function unreachable(provider: ProviderId): AiError {
  if (provider === "local") return new AiError("Couldn't reach the local bridge. Is `node hanyu-bridge.mjs` running in a terminal on this computer? If your browser asked to allow access to devices on your local network, allow it.");
  if (typeof navigator !== "undefined" && !navigator.onLine) return new AiError("You're offline. The AI assistant needs an internet connection.");
  if (provider === "ollama") return new AiError("Couldn't reach Ollama on this computer. Is it running, with OLLAMA_ORIGINS allowing this site?");
  return new AiError(`Couldn't reach ${PROVIDERS[provider].name}. Check your connection.`);
}

/* ---------- Anthropic (official SDK) ---------- */
async function anthropicClient(key: string) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  // Bring-your-own-key: the key belongs to the person using this browser, so browser use is intended.
  return { Anthropic, client: new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true, maxRetries: 1 }) };
}

async function anthropicError(e: unknown): Promise<AiError> {
  if (e instanceof AiError) return e;
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  if (e instanceof Anthropic.APIUserAbortError) return new AiError("Stopped.");
  if (e instanceof Anthropic.APIConnectionError) return unreachable("anthropic");
  if (e instanceof Anthropic.APIError) return friendly(e.status, "anthropic", e.message);
  return new AiError(e instanceof Error ? e.message : String(e));
}

async function anthropicChat(cfg: AiConfig, o: ChatOptions): Promise<string> {
  const { client } = await anthropicClient(cfg.key);
  // Haiku has no server-side refusal fallback; the larger models route declined requests automatically
  const fallback = cfg.model !== "claude-haiku-5-5";
  try {
    const stream = client.beta.messages.stream(
      {
        model: cfg.model,
        max_tokens: o.maxTokens ?? 8000,
        system: o.system,
        messages: o.messages,
        output_config: { effort: o.effort ?? "low" },
        ...(fallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
      },
      { signal: o.signal },
    );
    let text = "";
    for await (const ev of stream) {
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
        text += ev.delta.text;
        o.onText?.(text);
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === "refusal") throw new AiError("The model declined to answer that. Try rephrasing.");
    return text;
  } catch (e) {
    throw await anthropicError(e);
  }
}

/* ---------- OpenAI-compatible providers ---------- */
function headers(cfg: AiConfig): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (cfg.key) h.Authorization = `Bearer ${cfg.key}`;
  if (cfg.provider === "openrouter") { h["HTTP-Referer"] = window.location.origin; h["X-Title"] = "Hanyu Easy"; }
  return h;
}

async function compatChat(cfg: AiConfig, o: ChatOptions): Promise<string> {
  const base = PROVIDERS[cfg.provider].base!;
  let r: Response;
  try {
    r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: headers(cfg),
      body: JSON.stringify({ model: cfg.model, stream: true, messages: [{ role: "system", content: o.system }, ...o.messages] }),
      signal: o.signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw new AiError("Stopped.");
    throw unreachable(cfg.provider);
  }
  if (!r.ok || !r.body) {
    const detail = await errorText(r);
    throw friendly(r.status, cfg.provider, detail || `Request failed (${r.status}).`, detail);
  }
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        const l = line.trim();
        if (!l.startsWith("data:")) continue;
        const data = l.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const j = JSON.parse(data);
          if (j.error) throw new AiError(j.error.message ?? "The provider returned an error.");
          const d = j.choices?.[0]?.delta?.content;
          if (d) { text += d; o.onText?.(text); }
        } catch (e) {
          if (e instanceof AiError) throw e; // keep-alive comments and partial lines are skipped
        }
      }
    }
  } catch (e) {
    if (e instanceof AiError) throw e;
    if (e instanceof DOMException && e.name === "AbortError") throw new AiError("Stopped.");
    throw unreachable(cfg.provider);
  }
  return text;
}

/* ---------- local CLI bridge ---------- */
const bridgeUrl = (cfg: Pick<AiConfig, "bridge">) => (cfg.bridge || DEFAULT_BRIDGE).replace(/\/+$/, "");

async function bridgeFetch(cfg: Pick<AiConfig, "key" | "bridge">, path: string, init: RequestInit = {}): Promise<Response> {
  let r: Response;
  try {
    r = await fetch(`${bridgeUrl(cfg)}${path}`, { ...init, headers: { ...init.headers, Authorization: `Bearer ${cfg.key}` } });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw new AiError("Stopped.");
    throw unreachable("local");
  }
  if (r.status === 401) throw new AiError("The bridge rejected the pairing token. Copy it again from the terminal running the bridge.");
  if (!r.ok) throw new AiError((await errorText(r)) || `The bridge answered ${r.status}.`);
  return r;
}

/** Asks the bridge which CLIs it found. Also the "test connection" for the local provider. */
export async function bridgeHealth(cfg: Pick<AiConfig, "key" | "bridge">, refresh = false): Promise<BridgeHealth> {
  const r = await bridgeFetch(cfg, `/health${refresh ? "?refresh=1" : ""}`);
  const j = (await r.json()) as BridgeHealth & { bridge?: string };
  if (j.bridge !== "hanyu") throw new AiError("Something else is answering on that address, not the Hanyu bridge.");
  return j;
}

async function localChat(cfg: AiConfig, o: ChatOptions): Promise<string> {
  const r = await bridgeFetch(cfg, "/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cli: cfg.cli, model: cfg.model || undefined, system: o.system, messages: o.messages, effort: o.effort }),
    signal: o.signal,
  });
  if (!r.body) throw new AiError("The bridge sent an empty answer.");
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        let j: { text?: string; done?: boolean; error?: string };
        try { j = JSON.parse(line); } catch { continue; }
        if (j.error) throw new AiError(j.error);
        if (typeof j.text === "string") { text = j.text; o.onText?.(text); }
      }
    }
  } catch (e) {
    if (e instanceof AiError) throw e;
    if (e instanceof DOMException && e.name === "AbortError") throw new AiError("Stopped.");
    throw unreachable("local");
  }
  return text;
}

/* ---------- public API ---------- */
export type ChatOptions = {
  system: string;
  messages: ChatMsg[];
  /** called with the full text so far as it streams in */
  onText?: (text: string) => void;
  signal?: AbortSignal;
  maxTokens?: number;
  /** Claude only: how hard to think. "low" suits conversation; "medium" for detailed feedback. */
  effort?: Effort;
};

/** Streams a reply; resolves with the full text. Throws AiError with a message fit for the learner. */
export async function chat(cfg: AiConfig, o: ChatOptions): Promise<string> {
  // A request that never answers would leave the page "checking" forever: give up after a quiet spell.
  // Local tools start slower, and Codex answers all at once at the end, so they get longer.
  const slow = cfg.provider === "local" || cfg.provider === "ollama";
  const limit = slow ? 180_000 : 90_000;
  const ctl = new AbortController();
  const stop = () => ctl.abort();
  if (o.signal?.aborted) ctl.abort();
  o.signal?.addEventListener("abort", stop);
  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const arm = () => { clearTimeout(timer); timer = setTimeout(() => { timedOut = true; ctl.abort(); }, limit); };
  arm();
  const opts: ChatOptions = { ...o, signal: ctl.signal, onText: (t) => { arm(); o.onText?.(t); } };
  try {
    if (cfg.provider === "local") return await localChat(cfg, opts);
    return await (cfg.provider === "anthropic" ? anthropicChat(cfg, opts) : compatChat(cfg, opts));
  } catch (e) {
    if (!timedOut) throw e;
    const name = cfg.provider === "local" && cfg.cli ? LOCAL_CLIS[cfg.cli].name : PROVIDERS[cfg.provider].name;
    const hint = cfg.provider === "local"
      ? " Make sure it works in a terminal (you may need to sign in again), and check the bridge log in ~/.hanyu-bridge/bridge.log."
      : " It may be overloaded: try again, or pick a faster model under Account → AI assistant.";
    throw new AiError(`${name} didn't answer within ${limit / 60_000} minute${limit > 60_000 ? "s" : ""}, so the request was stopped.${hint}`);
  } finally {
    clearTimeout(timer);
    o.signal?.removeEventListener("abort", stop);
  }
}

/** Lists the models the key can use. Also serves as a free "test connection" (no tokens spent). */
export async function listModels(cfg: Pick<AiConfig, "provider" | "key">): Promise<string[]> {
  if (cfg.provider === "local") return Object.keys((await bridgeHealth(cfg)).clis);
  if (cfg.provider === "anthropic") {
    try {
      const { client } = await anthropicClient(cfg.key);
      const ids: string[] = [];
      for await (const m of client.models.list()) ids.push(m.id);
      return ids;
    } catch (e) {
      throw await anthropicError(e);
    }
  }
  const base = PROVIDERS[cfg.provider].base!;
  let r: Response;
  try {
    r = await fetch(`${base}/models`, { headers: headers({ ...cfg, model: "" }) });
  } catch {
    throw unreachable(cfg.provider);
  }
  if (cfg.provider === "gemini" && r.status === 404) return geminiFallbackTest(cfg.key);
  if (!r.ok) throw friendly(r.status, cfg.provider, `Request failed (${r.status}).`, await errorText(r));
  const j = (await r.json()) as { data?: { id: string }[] };
  let ids = (j.data ?? []).map((m) => m.id).sort();
  if (cfg.provider === "gemini") ids = geminiChatModels(ids);
  // OpenRouter's model list is public, so check the key separately
  if (cfg.provider === "openrouter") {
    const k = await fetch(`${base}/key`, { headers: headers({ ...cfg, model: "" }) }).catch(() => null);
    if (!k || !k.ok) throw friendly(k?.status ?? 401, "openrouter", "OpenRouter rejected the API key.");
  }
  return ids;
}

/* ---------- Gemini helpers ---------- */
const GEMINI_FALLBACK = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];

/** Gemini lists ids as "models/…" and includes embedding, image and audio models: keep text chat models only. */
function geminiChatModels(ids: string[]): string[] {
  return ids
    .map((id) => id.replace(/^models\//, ""))
    .filter((id) => /^gemini-/.test(id) && !/embed|image|tts|audio|live|vision|aqa|thinking-exp/.test(id));
}

/** If the model list isn't served on the compatibility endpoint, check the key with a one-token request. */
async function geminiFallbackTest(key: string): Promise<string[]> {
  const base = PROVIDERS.gemini.base!;
  let r: Response;
  try {
    r = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: PROVIDERS.gemini.defaultModel, max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
    });
  } catch {
    throw unreachable("gemini");
  }
  if (!r.ok) throw friendly(r.status, "gemini", `Request failed (${r.status}).`, await errorText(r));
  return GEMINI_FALLBACK;
}

/** version number in a Gemini model id, e.g. gemini-2.5-flash → 2.5 */
const geminiVersion = (id: string) => parseFloat(/^gemini-(\d+(?:\.\d+)?)/.exec(id)?.[1] ?? "0");

/** OpenRouter's free models end in ":free"; prefer ones that are good at Chinese. */
export function pickFreeModel(ids: string[]): string | null {
  const free = ids.filter((id) => id.endsWith(":free"));
  for (const re of [/deepseek/i, /qwen/i, /gemini/i, /llama/i]) { const hit = free.find((id) => re.test(id)); if (hit) return hit; }
  return free[0] ?? null;
}

/** Picks a sensible default model from a loaded list. */
export function pickModel(provider: ProviderId, ids: string[]): string {
  const p = PROVIDERS[provider];
  if (p.models) return p.defaultModel;
  if (provider === "gemini") {
    // newest stable Flash model: fast, and inside the free tier
    const flash = ids.filter((id) => /^gemini-\d+(\.\d+)?-flash$/.test(id)).sort((a, b) => geminiVersion(b) - geminiVersion(a));
    return flash[0] ?? (ids.includes(p.defaultModel) ? p.defaultModel : ids[0] ?? p.defaultModel);
  }
  for (const re of p.prefer ?? []) { const hit = ids.find((id) => re.test(id)); if (hit) return hit; }
  return ids.includes(p.defaultModel) ? p.defaultModel : ids[0] ?? p.defaultModel;
}

/** Pulls the first JSON object out of a model reply (tolerates code fences and surrounding text). */
export function parseJson<T>(text: string): T | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(text.slice(start, end + 1)) as T; } catch { return null; }
}
