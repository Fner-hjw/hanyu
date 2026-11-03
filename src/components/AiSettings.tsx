"use client";

import { useState } from "react";
import { Bot, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Badge } from "./ui";
import { useHydrated } from "@/lib/store";
import { getAiConfig, isFreeModel, listModels, pickFreeModel, pickModel, PROVIDERS, setAiConfig, useAiConfig, type ProviderId } from "@/lib/ai";

const ORDER: ProviderId[] = ["gemini", "opencode", "openrouter", "anthropic", "deepseek", "openai", "ollama"];

/** Account → AI assistant: choose a provider, paste a key, test it and pick a model. */
export function AiSettings() {
  // the saved key lives in localStorage, so render only after hydration
  return useHydrated() ? <Inner /> : null;
}

function Inner() {
  const saved = useAiConfig();
  const [draft] = useState(() => getAiConfig());
  const [provider, setProvider] = useState<ProviderId>(draft?.provider ?? "gemini");
  const [key, setKey] = useState(draft?.key ?? "");
  const [model, setModel] = useState(draft?.model ?? "");
  const [show, setShow] = useState(false);
  const [models, setModels] = useState<string[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const p = PROVIDERS[provider];

  const choose = (id: ProviderId) => {
    setProvider(id);
    setModels(null);
    setMsg(null);
    setModel(PROVIDERS[id].models ? PROVIDERS[id].defaultModel : "");
    if (id !== draft?.provider) setKey("");
    else { setKey(draft.key); setModel(draft.model); }
  };

  const test = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const ids = await listModels({ provider, key: key.trim() });
      setModels(ids);
      const m = model && (p.models || ids.includes(model)) ? model : pickModel(provider, ids);
      setModel(m);
      setAiConfig({ provider, key: key.trim(), model: m });
      setMsg({ ok: true, text: m ? `Connected and saved. Using ${m}.` : "Connected. Now pick a model." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) });
    }
    setBusy(false);
  };

  const canTest = !busy && (!p.needsKey || key.trim().length > 8);
  const listId = `models-${provider}`;

  return (
    <div className="card space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-2 font-semibold">
        <Bot size={18} /> AI assistant
        <Badge tone={saved ? "good" : "muted"}>{saved ? `on · ${PROVIDERS[saved.provider].name}` : "not connected"}</Badge>
      </div>
      <p className="text-sm text-muted">
        Connect your own AI account to use the conversation partner, writing feedback and speaking-test scoring. Google Gemini has a free
        daily allowance and OpenCode Zen has free models; with paid providers a practice conversation usually costs a few cents or less.
      </p>

      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="AI provider">
        {ORDER.map((id) => (
          <button key={id} type="button" role="radio" aria-checked={provider === id} onClick={() => choose(id)}
            className={`rounded-xl border p-3 text-left text-sm transition-colors ${provider === id ? "border-accent bg-accent-soft" : "border-line bg-card hover:bg-accent-soft"}`}>
            <span className="block font-semibold">{PROVIDERS[id].name}{PROVIDERS[id].badge && <span className="ml-1.5 text-xs font-medium text-good">{PROVIDERS[id].badge}</span>}</span>
            <span className="block text-xs text-muted">{PROVIDERS[id].blurb}</span>
          </button>
        ))}
      </div>

      {p.needsKey && (
        <label className="block">
          <span className="eyebrow flex items-center justify-between">
            API key
            {p.keyUrl && <a href={p.keyUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 normal-case tracking-normal text-accent">Get a key <ExternalLink size={12} /></a>}
          </span>
          <span className="relative mt-1 block">
            <input type={show ? "text" : "password"} value={key} onChange={(e) => setKey(e.target.value)} placeholder={p.keyPlaceholder}
              autoComplete="off" spellCheck={false} className="input pr-10 font-mono text-sm" />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide key" : "Show key"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </span>
        </label>
      )}

      <label className="block">
        <span className="eyebrow">Model</span>
        {p.models ? (
          <select className="input mt-1" value={model || p.defaultModel} onChange={(e) => setModel(e.target.value)}>
            {p.models.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        ) : (
          <>
            <input className="input mt-1 font-mono text-sm" list={listId} value={model} onChange={(e) => setModel(e.target.value)}
              placeholder={models ? "Type to search the list" : "Test the connection to load the list"} spellCheck={false} />
            <datalist id={listId}>{models && [...models].sort((a, b) => Number(isFreeModel(provider, b)) - Number(isFreeModel(provider, a))).map((m) => <option key={m} value={m} />)}</datalist>
            {models && (
              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                {models.length} models available
                {(provider === "openrouter" || provider === "opencode") && (() => {
                  const free = pickFreeModel(provider, models);
                  const n = models.filter((m) => isFreeModel(provider, m)).length;
                  return free ? (
                    <>
                      <span>· {n} free</span>
                      <button type="button" className="font-semibold text-accent" onClick={() => { setModel(free); setAiConfig({ provider, key: key.trim(), model: free }); setMsg({ ok: true, text: `Now using the free model ${free}. Free models have daily limits and can be slower.` }); }}>
                        Use a free model
                      </button>
                    </>
                  ) : null;
                })()}
              </span>
            )}
          </>
        )}
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary btn-sm" disabled={!canTest} onClick={test}>{busy ? "Testing…" : "Test & save"}</button>
        {saved && model && model !== saved.model && (
          <button type="button" className="btn btn-sm" onClick={() => { setAiConfig({ ...saved, model }); setMsg({ ok: true, text: `Now using ${model}.` }); }}>Use this model</button>
        )}
        {saved && (
          <button type="button" className="btn btn-sm text-accent" onClick={() => { setAiConfig(null); setKey(""); setModels(null); setMsg({ ok: true, text: "Disconnected and key removed from this device." }); }}>
            Disconnect
          </button>
        )}
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-good" : "text-accent"}`} role="status">{msg.text}</p>}
      <p className="text-xs text-muted">
        {provider === "gemini" && <>Create a free key at Google AI Studio with your Google account. The free tier has daily limits (Google may use free-tier conversations to improve its products). </>}
        {provider === "opencode" && <>Sign in at OpenCode, create a Zen API key and pick a model ending in &ldquo;-free&rdquo; (or press &ldquo;Use a free model&rdquo;). Free models are offered for a limited time, have rate limits, and their providers may use the conversations to improve their models. </>}
        Your key is stored only in this browser. It isn&apos;t synced to your account or sent to our server: requests go straight from your device to {p.name}.
        Testing the connection doesn&apos;t use any credit.
      </p>
    </div>
  );
}
