"use client";

import { useState } from "react";
import { Bot, Check, Download, Eye, EyeOff, ExternalLink, Terminal, X } from "lucide-react";
import { Badge } from "./ui";
import { useHydrated } from "@/lib/store";
import {
  bridgeHealth, DEFAULT_BRIDGE, getAiConfig, listModels, LOCAL_CLIS, pickFreeModel, pickModel, PROVIDERS, setAiConfig, useAiConfig,
  type AiConfig, type BridgeHealth, type LocalCli, type ProviderId,
} from "@/lib/ai";

const ORDER: ProviderId[] = ["gemini", "openrouter", "anthropic", "deepseek", "openai", "ollama", "local"];

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
        daily allowance; with paid providers a practice conversation usually costs a few cents or less.
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

      {provider === "local" ? <LocalSetup draft={draft?.provider === "local" ? draft : null} saved={saved} /> : <>
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
            <datalist id={listId}>{models && [...models].sort((a, b) => Number(b.endsWith(":free")) - Number(a.endsWith(":free"))).map((m) => <option key={m} value={m} />)}</datalist>
            {models && (
              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                {models.length} models available
                {provider === "openrouter" && (() => {
                  const free = pickFreeModel(models);
                  const n = models.filter((m) => m.endsWith(":free")).length;
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
        Your key is stored only in this browser. It isn&apos;t synced to your account or sent to our server: requests go straight from your device to {p.name}.
        Testing the connection doesn&apos;t use any credit.
      </p>
      </>}
    </div>
  );
}

/** Account → AI assistant → Local CLI: pair with the bridge script and pick which installed CLI answers. */
function LocalSetup({ draft, saved }: { draft: AiConfig | null; saved: AiConfig | null }) {
  const [token, setToken] = useState(draft?.key ?? "");
  const [bridge, setBridge] = useState(draft?.bridge ?? DEFAULT_BRIDGE);
  const [cli, setCli] = useState<LocalCli | null>(draft?.cli ?? null);
  const [model, setModel] = useState(draft?.model ?? "");
  const [show, setShow] = useState(false);
  const [advanced, setAdvanced] = useState(!!draft?.bridge && draft.bridge !== DEFAULT_BRIDGE);
  const [health, setHealth] = useState<BridgeHealth | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const command = `node hanyu-bridge.mjs --origin ${origin}`;
  const installCommand = `node hanyu-bridge.mjs --install --origin ${origin}`;
  const savedLocal = saved?.provider === "local" ? saved : null;

  const save = (c: LocalCli, m: string, text?: string) => {
    setAiConfig({ provider: "local", key: token.trim(), model: m.trim(), cli: c, bridge: bridge.trim() === DEFAULT_BRIDGE ? undefined : bridge.trim() });
    setMsg({ ok: true, text: text ?? `Saved. Using ${LOCAL_CLIS[c].name}${m ? ` (${m})` : ""}.` });
  };

  const connect = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const h = await bridgeHealth({ key: token.trim(), bridge: bridge.trim() }, true);
      setHealth(h);
      const found = (Object.keys(LOCAL_CLIS) as LocalCli[]).filter((id) => h.clis[id]?.available);
      if (!found.length) {
        setMsg({ ok: false, text: "The bridge is running, but it found none of the CLIs. Install one (below), sign in to it in a terminal, then test again." });
      } else {
        const c = cli && found.includes(cli) ? cli : found[0];
        setCli(c);
        const m = c === cli ? model : "";
        setModel(m);
        save(c, m, `Connected and saved. Using ${LOCAL_CLIS[c].name}.`);
      }
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) });
    }
    setBusy(false);
  };

  const pick = (c: LocalCli) => { setCli(c); setModel(""); if (health) save(c, ""); };
  const dirty = savedLocal && cli && (cli !== savedLocal.cli || model.trim() !== savedLocal.model);

  return (
    <div className="space-y-4">
      <ol className="list-decimal space-y-3 pl-5 text-sm">
        <li>
          Install and sign in to at least one AI command-line tool on this computer:{" "}
          {(Object.keys(LOCAL_CLIS) as LocalCli[]).map((id, i) => (
            <span key={id}>{i > 0 && ", "}<b>{LOCAL_CLIS[id].name}</b> (<code className="text-xs">{LOCAL_CLIS[id].install}</code>)</span>
          ))}
          . Run it once in a terminal to sign in. It then uses your own plan or account.
        </li>
        <li>
          Download the bridge (a small script, no packages needed, Node.js 18 or newer) and run it in a terminal from the folder where you saved it:
          <span className="mt-2 flex flex-wrap items-center gap-2">
            <a href="/hanyu-bridge.mjs" download className="btn btn-sm"><Download size={14} /> hanyu-bridge.mjs</a>
          </span>
          <span className="mt-2 block"><b>Recommended:</b> start it automatically every time you log in. Run this once; it keeps running in the background, with no window to keep open:</span>
          <code className="mt-1 flex items-start gap-2 break-all rounded-lg border border-line bg-card px-3 py-2 font-mono text-xs"><Terminal size={14} className="mt-0.5 shrink-0" />{installCommand}</code>
          <span className="mt-2 block text-xs text-muted">
            Works on macOS, Windows and Linux. To turn it off later, run the command it prints (ending in <code>--uninstall</code>).
            Or, to run it only for this session, use <code>{command}</code> and keep the terminal open.
          </span>
        </li>
        <li>Copy the pairing token it prints, paste it here and test the connection.</li>
      </ol>

      <label className="block">
        <span className="eyebrow">Pairing token</span>
        <span className="relative mt-1 block">
          <input type={show ? "text" : "password"} value={token} onChange={(e) => setToken(e.target.value)} placeholder="hb_…"
            autoComplete="off" spellCheck={false} className="input pr-10 font-mono text-sm" />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide token" : "Show token"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
      </label>

      {advanced ? (
        <label className="block">
          <span className="eyebrow">Bridge address</span>
          <input className="input mt-1 font-mono text-sm" value={bridge} onChange={(e) => setBridge(e.target.value)} placeholder={DEFAULT_BRIDGE} spellCheck={false} />
          <span className="mt-1 block text-xs text-muted">Change it only if you started the bridge with --port.</span>
        </label>
      ) : (
        <button type="button" className="text-xs font-semibold text-accent" onClick={() => setAdvanced(true)}>Different port?</button>
      )}

      {health && (
        <div className="space-y-2" role="radiogroup" aria-label="Command-line tool">
          <span className="eyebrow">Tool to use</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(LOCAL_CLIS) as LocalCli[]).map((id) => {
              const h = health.clis[id];
              return (
                <button key={id} type="button" role="radio" aria-checked={cli === id} disabled={!h?.available} onClick={() => pick(id)}
                  className={`rounded-xl border p-3 text-left text-sm transition-colors disabled:opacity-50 ${cli === id ? "border-accent bg-accent-soft" : "border-line bg-card hover:bg-accent-soft"}`}>
                  <span className="flex items-center gap-1.5 font-semibold">{h?.available ? <Check size={14} className="text-good" /> : <X size={14} />}{LOCAL_CLIS[id].name}</span>
                  <span className="block truncate text-xs text-muted">{h?.available ? h.version : "not found"}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {cli && (
        <label className="block">
          <span className="eyebrow">Model</span>
          <input className="input mt-1 font-mono text-sm" list={`local-models-${cli}`} value={model} onChange={(e) => setModel(e.target.value)}
            placeholder={`Default (your ${LOCAL_CLIS[cli].name} setting)`} spellCheck={false} />
          <datalist id={`local-models-${cli}`}>{LOCAL_CLIS[cli].models.filter((m) => m.id).map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</datalist>
          <span className="mt-1 block text-xs text-muted">Leave empty to use the tool&apos;s own default{cli === "claude" ? ", or type opus, sonnet or haiku" : ""}.</span>
        </label>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary btn-sm" disabled={busy || token.trim().length < 20} onClick={connect}>{busy ? "Testing…" : "Test & save"}</button>
        {dirty && <button type="button" className="btn btn-sm" onClick={() => save(cli, model)}>Save choice</button>}
        {savedLocal && (
          <button type="button" className="btn btn-sm text-accent" onClick={() => { setAiConfig(null); setToken(""); setHealth(null); setMsg({ ok: true, text: "Disconnected and token removed from this device." }); }}>
            Disconnect
          </button>
        )}
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-good" : "text-accent"}`} role="status">{msg.text}</p>}
      <p className="text-xs text-muted">
        Everything stays on your computer: the token is stored only in this browser, the bridge listens only on this computer and
        answers only pages that have the token, and the tool runs with its file and command tools switched off. Your text goes from this
        browser to the bridge and from the tool to its own provider, never through our server. Works in Chrome, Edge and Firefox on a
        computer (not on phones); Chrome may ask to allow access to devices on your local network.{" "}
        <a href="/hanyu-bridge.mjs" target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-accent">Read the script <ExternalLink size={11} /></a>
      </p>
    </div>
  );
}
