"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Bot, CheckCircle2, Flag, Languages, Mic, Send, Square, Target } from "lucide-react";
import { Annotated } from "@/components/Annotated";
import { SpeakButton } from "@/components/Speak";
import { Badge, PageHeader } from "@/components/ui";
import { SCENARIOS } from "@/data/scenarios";
import type { Scenario } from "@/data/types";
import { AiError, chat, parseJson, useAiConfig, type AiConfig, type ChatMsg } from "@/lib/ai";
import { recognitionSupported, useRecognizer } from "@/lib/speech";
import { addToBank, logPractice, useAppState, useHydrated } from "@/lib/store";

const CATS: Record<Scenario["category"], string> = {
  meetings: "Meetings", clients: "Clients", negotiation: "Negotiation", reporting: "Reporting", phone: "Phone", social: "Social", daily: "Daily life",
};

/** a scene-less chat with a friendly colleague, at the learner's level */
const FREE: Scenario = {
  id: "s-free", title: "Free conversation", titleZh: "自由聊天", category: "social", level: 4,
  aiRole: "小王, a friendly colleague in the finance team who enjoys chatting", userRole: "Yourself",
  brief: "Chat about anything: your day, work, weekend plans, news. Your partner keeps it going and corrects you as you go.",
  goals: ["Keep the conversation going for 10 turns", "Try at least two new words"],
  opening: "嗨，忙完了吗？今天过得怎么样？", openingEn: "Hi, done with work? How was your day?",
  phrases: [], notes: "Be curious and ask follow-up questions about the learner's life and work. Introduce a new topic if the conversation stalls.",
};

export default function Talk() {
  return useHydrated() ? <Inner /> : null;
}

function Inner() {
  const cfg = useAiConfig();
  const [sc, setSc] = useState<Scenario | null>(null);
  if (!cfg) return <NotConnected />;
  return sc ? <Chat key={sc.id} sc={sc} cfg={cfg} onExit={() => setSc(null)} /> : <Picker onPick={setSc} />;
}

function NotConnected() {
  return (
    <div>
      <PageHeader title="Talk" subtitle="Role-play real situations with an AI partner who corrects you as you go." />
      <div className="card max-w-xl space-y-3 p-6">
        <div className="flex items-center gap-2 font-semibold"><Bot size={20} /> Connect your AI to start</div>
        <p className="text-sm text-muted">
          The conversation partner uses your own AI account (Claude, OpenAI, DeepSeek, OpenRouter or a local Ollama model).
          Your key stays on this device and you pay the provider directly, usually a few cents per conversation.
        </p>
        <Link href="/account" className="btn btn-primary">Set up in Account → AI assistant</Link>
      </div>
    </div>
  );
}

function Picker({ onPick }: { onPick: (s: Scenario) => void }) {
  const [cat, setCat] = useState<Scenario["category"] | "all">("all");
  const list = SCENARIOS.filter((s) => cat === "all" || s.category === cat);
  const cats = [...new Set(SCENARIOS.map((s) => s.category))];
  return (
    <div>
      <PageHeader title="Talk" subtitle="Pick a situation and role-play it in Chinese. Your partner stays in character and corrects each message." />
      <button onClick={() => onPick(FREE)} className="card mb-4 flex w-full items-center gap-4 p-4 text-left hover:-translate-y-0.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-soft text-sky"><Languages size={22} /></span>
        <span className="min-w-0 flex-1"><span className="block font-semibold">Free conversation</span><span className="block text-sm text-muted">{FREE.brief}</span></span>
      </button>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button className="chip" data-active={cat === "all"} onClick={() => setCat("all")}>All</button>
        {cats.map((c) => <button key={c} className="chip" data-active={cat === c} onClick={() => setCat(c)}>{CATS[c]}</button>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((s) => (
          <button key={s.id} onClick={() => onPick(s)} className="card flex flex-col gap-1 p-4 text-left hover:-translate-y-0.5">
            <span className="flex items-center gap-2"><span className="font-semibold">{s.title}</span><Badge tone="sky">HSK {s.level}</Badge></span>
            <span className="han text-sm text-muted">{s.titleZh}</span>
            <span className="text-sm text-muted">{s.brief}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- the conversation ---------- */

type Turn = { role: "user" | "assistant"; raw: string };
type Reply = { zh: string; en: string; fix: { better: string; why: string } | null };

/** Replies come back as: Chinese, then "EN: …", then "FIX: better | why" or "FIX: OK". */
function parseReply(raw: string): Reply {
  const en = raw.search(/^\s*EN\s*[:：]/m);
  const fx = raw.search(/^\s*FIX\s*[:：]/m);
  const cut = [en, fx].filter((i) => i >= 0);
  const zh = (cut.length ? raw.slice(0, Math.min(...cut)) : raw).trim();
  const enText = en >= 0 ? raw.slice(en).replace(/^\s*EN\s*[:：]\s*/, "").split(/\n\s*FIX\s*[:：]/)[0].trim() : "";
  let fix: Reply["fix"] = null;
  if (fx >= 0) {
    const f = raw.slice(fx).replace(/^\s*FIX\s*[:：]\s*/, "").trim();
    if (f && !/^ok\.?$/i.test(f)) {
      const [better, ...why] = f.split("|");
      fix = { better: better.trim(), why: why.join("|").trim() };
    }
  }
  return { zh, en: enText, fix };
}

function systemPrompt(sc: Scenario, level: number) {
  return `You are a role-play partner in a Mandarin practice app. The learner is an English speaker at about HSK ${level} who works in finance.

Scenario: ${sc.brief}
You play: ${sc.aiRole}
The learner plays: ${sc.userRole}
The learner's goals: ${sc.goals.join("; ")}
Character direction: ${sc.notes}

How to reply:
- Stay in character and keep the conversation moving. End each reply with something the learner can respond to.
- Speak natural, simplified mainland Mandarin at about HSK ${level}: one to three short sentences, everyday words. No pinyin.
- If the learner writes English or mixes languages, answer in character in simpler Chinese.

Format every reply exactly like this, with nothing before or after:
<your reply in Chinese>
EN: <English translation of your reply>
FIX: <if the learner's last message had a mistake or sounded unnatural: the corrected, natural Chinese, then " | ", then one short English sentence explaining why. If it was fine: OK>`;
}

function Chat({ sc, cfg, onExit }: { sc: Scenario; cfg: AiConfig; onExit: () => void }) {
  const settings = useAppState().settings;
  const [level, setLevel] = useState<number>(sc.id === FREE.id ? Math.min(6, Math.max(3, settings.targetLevel - 1)) : sc.level);
  const [turns, setTurns] = useState<Turn[]>([{ role: "assistant", raw: `${sc.opening}\nEN: ${sc.openingEn}\nFIX: OK` }]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPy, setShowPy] = useState(true);
  const [showEn, setShowEn] = useState<Record<number, boolean>>({});
  const [review, setReview] = useState<"open" | null>(null);
  const abort = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const rec = useRecognizer();
  const heard = rec.alternatives[0] ?? "";
  const [usedHeard, setUsedHeard] = useState<string[] | null>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [turns.length, streaming]);
  useEffect(() => () => abort.current?.abort(), []);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || streaming !== null) return;
    const next: Turn[] = [...turns, { role: "user", raw: t }];
    setTurns(next);
    setInput("");
    setError(null);
    setStreaming("");
    logPractice(1);
    abort.current = new AbortController();
    // the API wants the conversation to start with the learner, so a short cue precedes the opening line
    const messages: ChatMsg[] = [{ role: "user", content: "（开始）" }, ...next.map((x) => ({ role: x.role, content: x.raw }))];
    try {
      const out = await chat(cfg, { system: systemPrompt(sc, level), messages, onText: setStreaming, signal: abort.current.signal, effort: "low", maxTokens: 2000 });
      setTurns((cur) => [...cur, { role: "assistant", raw: out }]);
    } catch (e) {
      setError(e instanceof AiError ? e.message : String(e));
      // put the message back so it can be resent
      setTurns((cur) => cur.slice(0, -1));
      setInput(t);
    }
    setStreaming(null);
  };

  const userCount = turns.filter((t) => t.role === "user").length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={onExit} className="btn btn-sm"><ArrowLeft size={15} /> Scenarios</button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{sc.title} <span className="han text-muted">· {sc.titleZh}</span></div>
        </div>
        <select aria-label="Language level" className="input w-auto py-1 text-sm" value={level} onChange={(e) => setLevel(+e.target.value)}>
          {[2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>HSK {l}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={showPy} onChange={(e) => setShowPy(e.target.checked)} /> Pinyin</label>
      </div>

      <details className="card-flat mb-4 p-4 text-sm" open={userCount === 0}>
        <summary className="cursor-pointer font-semibold"><Target size={15} className="mr-1.5 inline" />Your role and goals</summary>
        <p className="mt-2"><b>You:</b> {sc.userRole}. <b>Partner:</b> {sc.aiRole}.</p>
        <p className="mt-1 text-muted">{sc.brief}</p>
        <ul className="mt-2 list-disc pl-5">{sc.goals.map((g) => <li key={g}>{g}</li>)}</ul>
        {sc.phrases.length > 0 && (
          <div className="mt-3">
            <div className="eyebrow mb-1">Useful phrases</div>
            <ul className="space-y-1.5">
              {sc.phrases.map((p) => (
                <li key={p.zh} className="flex items-start gap-2">
                  <SpeakButton text={p.zh.replace(/……/g, "")} size="sm" />
                  <span><span className="han">{p.zh}</span><span className="block text-xs text-muted">{p.en}</span></span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </details>

      <div className="space-y-3" aria-live="polite">
        {turns.map((t, i) => {
          if (t.role === "user") {
            const reply = turns[i + 1]?.role === "assistant" ? parseReply(turns[i + 1].raw) : null;
            return (
              <div key={i} className="flex flex-col items-end gap-1">
                <div className="han max-w-[85%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-lg text-accent-fg">{t.raw}</div>
                {reply && (reply.fix ? (
                  <div className="max-w-[85%] rounded-xl border border-gold/40 bg-gold-soft px-3 py-2 text-sm">
                    <div className="flex items-center gap-2"><span className="han text-base">{reply.fix.better}</span><SpeakButton text={reply.fix.better} size="sm" /></div>
                    {reply.fix.why && <div className="text-xs text-muted">{reply.fix.why}</div>}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-good"><CheckCircle2 size={13} /> Natural</div>
                ))}
              </div>
            );
          }
          const r = parseReply(t.raw);
          return (
            <Bubble key={i} zh={r.zh} en={r.en} showPy={showPy} showEn={!!showEn[i]} onToggleEn={() => setShowEn((m) => ({ ...m, [i]: !m[i] }))} />
          );
        })}
        {streaming !== null && (
          <div className="card max-w-[85%] p-4">
            {parseReply(streaming).zh ? <span className="han text-xl">{parseReply(streaming).zh}</span> : <span className="text-sm text-muted">Thinking…</span>}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="mt-3 text-sm text-accent" role="alert">{error}</p>}

      {review ? (
        <Review sc={sc} cfg={cfg} level={level} turns={turns} onClose={() => setReview(null)} />
      ) : (
        <div className="sticky bottom-20 mt-4 space-y-2 lg:bottom-4">
          {heard && !rec.listening && usedHeard !== rec.alternatives && (
            <div className="card flex flex-wrap items-center gap-2 p-3 text-sm">
              <span className="text-muted">Heard:</span><span className="han text-base">{heard}</span>
              <span className="ml-auto flex gap-2">
                <button className="btn btn-sm" onClick={() => { setInput(heard); setUsedHeard(rec.alternatives); }}>Edit</button>
                <button className="btn btn-primary btn-sm" onClick={() => { setUsedHeard(rec.alternatives); void send(heard); }}>Send</button>
              </span>
            </div>
          )}
          {rec.error && <p className="text-sm text-accent">{rec.error}</p>}
          <form className="card flex items-end gap-2 p-2" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
            {recognitionSupported() && (
              <button type="button" onClick={() => (rec.listening ? rec.stop() : rec.start())} aria-label={rec.listening ? "Stop listening" : "Speak your answer"}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${rec.listening ? "bg-accent text-accent-fg" : "bg-accent-soft text-accent"}`}>
                {rec.listening ? <Square size={16} /> : <Mic size={18} />}
              </button>
            )}
            <textarea value={rec.listening ? rec.interim : input} onChange={(e) => setInput(e.target.value)} rows={1} lang="zh-CN"
              placeholder={rec.listening ? "Listening…" : "Type or speak in Chinese…"} aria-label="Your message"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(input); } }}
              className="han min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-lg outline-none" />
            {streaming !== null ? (
              <button type="button" onClick={() => abort.current?.abort()} className="btn btn-sm" aria-label="Stop"><Square size={14} /></button>
            ) : (
              <button className="btn btn-primary btn-sm h-10" disabled={!input.trim()} aria-label="Send"><Send size={15} /></button>
            )}
          </form>
          <div className="flex justify-between text-xs text-muted">
            <span>Enter to send · Shift+Enter for a new line</span>
            <button className="flex items-center gap-1 font-semibold text-accent disabled:opacity-40" disabled={userCount < 2 || streaming !== null} onClick={() => setReview("open")}>
              <Flag size={13} /> Finish & get feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Bubble({ zh, en, showPy, showEn, onToggleEn }: { zh: string; en: string; showPy: boolean; showEn: boolean; onToggleEn: () => void }) {
  return (
    <div className="card max-w-[85%] p-4">
      <Annotated text={zh} showPinyin={showPy} />
      <div className="mt-2 flex items-center gap-2">
        <SpeakButton text={zh} size="sm" />
        {en && <button className="text-xs font-semibold text-muted hover:text-fg" onClick={onToggleEn}>{showEn ? "Hide English" : "English"}</button>}
      </div>
      {showEn && en && <p className="mt-1 text-sm text-muted">{en}</p>}
    </div>
  );
}

/* ---------- end-of-conversation review ---------- */

type Feedback = {
  summary: string;
  score: number;
  goals: { goal: string; met: boolean; note?: string }[];
  corrections: { you: string; better: string; why: string }[];
  words: { zh: string; py: string; en: string }[];
};

function Review({ sc, cfg, level, turns, onClose }: { sc: Scenario; cfg: AiConfig; level: number; turns: Turn[]; onClose: () => void }) {
  const bank = useAppState().bank;
  const [fb, setFb] = useState<Feedback | null>(null);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const ctrl = new AbortController();
    const transcript = turns.map((t) => (t.role === "user" ? `LEARNER: ${t.raw}` : `PARTNER: ${parseReply(t.raw).zh}`)).join("\n");
    chat(cfg, {
      system: "You are an encouraging but precise Mandarin teacher reviewing a learner's role-play. Reply with JSON only.",
      messages: [{
        role: "user",
        content: `Scenario: ${sc.brief}\nLearner's role: ${sc.userRole}\nLearner level: about HSK ${level}\nGoals: ${sc.goals.join("; ")}\n\nTranscript:\n${transcript}\n\n` +
          `Return one JSON object with these keys:\n` +
          `"summary": 2-3 English sentences on how the learner did,\n"score": 0-100 for communication and accuracy at their level,\n` +
          `"goals": [{"goal": string, "met": boolean, "note": short English}] for each goal,\n` +
          `"corrections": up to 5 of the learner's most useful mistakes as [{"you": their Chinese, "better": natural Chinese, "why": short English}],\n` +
          `"words": 5 useful words or phrases from this situation they should learn, as [{"zh", "py" (pinyin with tone marks), "en"}].`,
      }],
      effort: "medium",
      maxTokens: 4000,
      signal: ctrl.signal,
    }).then(
      (out) => { const j = parseJson<Feedback>(out); if (j) setFb(j); else setRaw(out); },
      (e) => setError(e instanceof AiError ? e.message : String(e)),
    );
    return () => ctrl.abort();
  }, [cfg, level, sc, turns]);

  return (
    <div className="card mt-5 space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Feedback</div>
        <button className="btn btn-sm" onClick={onClose}>Keep talking</button>
      </div>
      {!fb && !raw && !error && <p className="text-sm text-muted">Reviewing your conversation…</p>}
      {error && <p className="text-sm text-accent">{error}</p>}
      {raw && <p className="whitespace-pre-wrap text-sm">{raw}</p>}
      {fb && (
        <>
          <div className="flex items-center gap-3">
            {typeof fb.score === "number" && <span className="text-3xl font-bold">{Math.round(fb.score)}</span>}
            <p className="text-sm">{fb.summary}</p>
          </div>
          {fb.goals?.length > 0 && (
            <ul className="space-y-1 text-sm">
              {fb.goals.map((g, i) => (
                <li key={i} className="flex gap-2"><span className={g.met ? "text-good" : "text-muted"}>{g.met ? "✓" : "○"}</span><span>{g.goal}{g.note && <span className="text-muted"> · {g.note}</span>}</span></li>
              ))}
            </ul>
          )}
          {fb.corrections?.length > 0 && (
            <div>
              <div className="eyebrow mb-1.5">Corrections</div>
              <ul className="space-y-2">
                {fb.corrections.map((c, i) => (
                  <li key={i} className="rounded-xl bg-card2 p-3 text-sm">
                    <div className="han text-muted line-through decoration-1">{c.you}</div>
                    <div className="flex items-center gap-2"><span className="han text-base">{c.better}</span><SpeakButton text={c.better} size="sm" /></div>
                    <div className="text-xs text-muted">{c.why}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {fb.words?.length > 0 && (
            <div>
              <div className="eyebrow mb-1.5">Words to learn</div>
              <ul className="space-y-1.5">
                {fb.words.map((w) => {
                  const id = `bank:${w.zh}`;
                  return (
                    <li key={w.zh} className="flex items-center gap-2 text-sm">
                      <SpeakButton text={w.zh} size="sm" />
                      <span className="han text-base">{w.zh}</span><span className="text-muted">{w.py} · {w.en}</span>
                      <button className="btn btn-sm ml-auto" disabled={!!bank[id]} onClick={() => addToBank(id, { zh: w.zh, py: w.py, en: w.en })}>
                        {bank[id] ? "Saved" : "Add to my words"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
