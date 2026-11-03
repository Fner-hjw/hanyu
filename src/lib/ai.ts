"use client";

/**
 * "Bring your own key" AI connection. The learner's provider, model and API key are kept in
 * localStorage on this device only: never in the synced progress, never sent to our server.
 * Requests go straight from the browser to the provider.
 *
 * Claude goes through the official Anthropic SDK; the other providers speak the OpenAI-style
 * chat-completions protocol, so they share one small streaming client.
 */
import { useSyncExternalStore } from "react";

export type ProviderId = "anthropic" | "openai" | "deepseek" | "openrouter" | "ollama";
export type AiConfig = { provider: ProviderId; key: string; model: string };
export type ChatMsg = { role: "user" | "assistant"; content: string };
export type Effort = "low" | "medium" | "high";

type Provider = {
  name: string;
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
    blurb: "Free, runs locally. Start Ollama with OLLAMA_ORIGINS set to this site's address.",
    needsKey: false,
    base: "http://localhost:11434/v1",
    defaultModel: "",
    prefer: [/qwen/i, /deepseek/i, /llama/i],
  },
};

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
  return c && c.model && (c.key || !PROVIDERS[c.provider].needsKey) ? c : null;
}

/* ---------- errors ---------- */
export class AiError extends Error {}

function friendly(status: number | undefined, provider: ProviderId, fallback: string): AiError {
  const name = PROVIDERS[provider].name;
  if (status === 401 || status === 403) return new AiError(`${name} rejected the API key. Check it under Account → AI assistant.`);
  if (status === 402) return new AiError(`Your ${name} account is out of credit.`);
  if (status === 404) return new AiError(`${name} doesn't know that model. Pick another under Account → AI assistant.`);
  if (status === 429) return new AiError(`${name} is rate-limiting requests or your credit ran out. Wait a moment and try again.`);
  if (status && status >= 500) return new AiError(`${name} is having problems right now. Try again shortly.`);
  return new AiError(fallback);
}
function unreachable(provider: ProviderId): AiError {
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
  if (cfg.provider === "openrouter") { h["HTTP-Referer"] = window.location.origin; h["X-Title"] = "Hanyu"; }
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
    let detail = "";
    try { const j = await r.json(); detail = j?.error?.message ?? ""; } catch { /* not JSON */ }
    throw friendly(r.status, cfg.provider, detail || `Request failed (${r.status}).`);
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
export function chat(cfg: AiConfig, o: ChatOptions): Promise<string> {
  return cfg.provider === "anthropic" ? anthropicChat(cfg, o) : compatChat(cfg, o);
}

/** Lists the models the key can use. Also serves as a free "test connection" (no tokens spent). */
export async function listModels(cfg: Pick<AiConfig, "provider" | "key">): Promise<string[]> {
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
  if (!r.ok) throw friendly(r.status, cfg.provider, `Request failed (${r.status}).`);
  const j = (await r.json()) as { data?: { id: string }[] };
  const ids = (j.data ?? []).map((m) => m.id).sort();
  // OpenRouter's model list is public, so check the key separately
  if (cfg.provider === "openrouter") {
    const k = await fetch(`${base}/key`, { headers: headers({ ...cfg, model: "" }) }).catch(() => null);
    if (!k || !k.ok) throw friendly(k?.status ?? 401, "openrouter", "OpenRouter rejected the API key.");
  }
  return ids;
}

/** Picks a sensible default model from a loaded list. */
export function pickModel(provider: ProviderId, ids: string[]): string {
  const p = PROVIDERS[provider];
  if (p.models) return p.defaultModel;
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
