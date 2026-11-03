"use client";

import { useState, type ReactNode } from "react";
import { Calculator, Check, Copy, Handshake, Mail, MessageSquare, Ruler, Search } from "lucide-react";
import { NumbersTrainer } from "./NumbersTrainer";
import { ETIQUETTE, EMAILS, MEASURE_WORDS, PHRASES } from "@/data/toolkit";
import { Annotated } from "@/components/Annotated";
import { SpeakButton } from "@/components/Speak";
import { Badge, Empty, PageHeader } from "@/components/ui";

type Tab = "emails" | "phrases" | "numbers" | "measure" | "etiquette";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: "emails", label: "Emails", icon: <Mail size={15} /> },
  { id: "phrases", label: "Phrases", icon: <MessageSquare size={15} /> },
  { id: "numbers", label: "Numbers & money", icon: <Calculator size={15} /> },
  { id: "measure", label: "Measure words", icon: <Ruler size={15} /> },
  { id: "etiquette", label: "Etiquette", icon: <Handshake size={15} /> },
];

export default function ToolkitPage() {
  const [tab, setTab] = useState<Tab>("emails");
  return (
    <div>
      <PageHeader
        title="Work toolkit"
        subtitle="Email templates, ready-made phrases, a numbers & money trainer, measure words and etiquette tips for using Chinese at work."
      />
      <div className="noscroll -mx-1 mb-5 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Toolkit sections">
        {TABS.map((t) => (
          <button key={t.id} className="chip" data-active={tab === t.id} onClick={() => setTab(t.id)}>
            <span className="mr-1.5 inline-flex align-middle">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "emails" && <EmailsTab />}
      {tab === "phrases" && <PhrasesTab />}
      {tab === "numbers" && <NumbersTrainer />}
      {tab === "measure" && <MeasureTab />}
      {tab === "etiquette" && <EtiquetteTab />}
    </div>
  );
}

function Toggle({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {children}
    </label>
  );
}

function EmailsTab() {
  const [id, setId] = useState(EMAILS[0]?.id ?? "");
  const [showPy, setShowPy] = useState(true);
  const [showEn, setShowEn] = useState(false);
  const [copied, setCopied] = useState(false);
  const email = EMAILS.find((e) => e.id === id);

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email.zh);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <ul className="space-y-2" aria-label="Email templates">
        {EMAILS.map((e) => (
          <li key={e.id}>
            <button
              className={`card w-full p-3 text-left hover:bg-card2 ${e.id === id ? "ring-2 ring-accent" : ""}`}
              aria-pressed={e.id === id}
              onClick={() => {
                setId(e.id);
                if (window.innerWidth < 1024) setTimeout(() => document.getElementById("email-view")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
              }}
            >
              <span className="block font-semibold">{e.title}</span>
              <span className="mt-0.5 block text-sm text-muted">{e.when}</span>
            </button>
          </li>
        ))}
      </ul>

      {email ? (
        <div id="email-view" className="card min-w-0 scroll-mt-16 space-y-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2 className="mr-auto text-lg font-semibold">{email.title}</h2>
            <Toggle checked={showPy} onChange={setShowPy}>Pinyin</Toggle>
            <Toggle checked={showEn} onChange={setShowEn}>English</Toggle>
            <SpeakButton text={email.zh.replace(/【[^】]*】/g, "").replace(/\n+/g, "。")} rate={0.85} label="Read whole email aloud" />
            <button className="btn btn-sm" onClick={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy Chinese"}
            </button>
          </div>

          <div>
            {email.zh.split("\n").map((line, i) =>
              line.trim() ? <Annotated key={`${email.id}-${i}`} text={line} showPinyin={showPy} size="text-lg" /> : <div key={`${email.id}-${i}`} className="h-3" />,
            )}
          </div>

          {showEn && (
            <div className="card-flat p-3 text-sm text-muted">
              {email.en.split("\n").map((line, i) => (line.trim() ? <p key={i}>{line}</p> : <div key={i} className="h-3" />))}
            </div>
          )}

          {email.notes.length > 0 && (
            <div className="rounded-xl bg-gold-soft p-4">
              <p className="eyebrow mb-2">Tips</p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {email.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <Empty title="No templates yet" />
      )}
    </div>
  );
}

function PhrasesTab() {
  const [gid, setGid] = useState(PHRASES[0]?.id ?? "");
  const [practice, setPractice] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const group = PHRASES.find((g) => g.id === gid);

  const reveal = (key: string) => setRevealed((prev) => new Set(prev).add(key));
  const pick = (id: string) => { setGid(id); setRevealed(new Set()); };

  return (
    <div className="space-y-4">
      <div className="noscroll -mx-1 flex gap-2 overflow-x-auto px-1" role="group" aria-label="Situations">
        {PHRASES.map((g) => (
          <button key={g.id} className="chip shrink-0" data-active={g.id === gid} onClick={() => pick(g.id)}>{g.situation}</button>
        ))}
      </div>

      {group ? (
        <div className="card p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <p className="max-w-2xl text-sm text-muted">{group.intro}</p>
            <Toggle checked={practice} onChange={(v) => { setPractice(v); setRevealed(new Set()); }}>Practice mode</Toggle>
          </div>
          <ul className="divide-y divide-line">
            {group.phrases.map((p, i) => {
              const key = `${group.id}-${i}`;
              const hidden = practice && !revealed.has(key);
              return (
                <li key={key} className="flex items-start gap-3 py-3">
                  <SpeakButton text={p.zh} size="sm" rate={0.85} />
                  <div className="min-w-0 flex-1">
                    {hidden ? (
                      <p>{p.en}</p>
                    ) : (
                      <>
                        <p className="han text-lg">{p.zh}</p>
                        <p className="text-sm text-muted">{p.en}</p>
                        {p.note && <span className="mt-1 inline-block"><Badge>{p.note}</Badge></span>}
                      </>
                    )}
                  </div>
                  {hidden && <button className="btn btn-sm" onClick={() => reveal(key)}>Reveal</button>}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <Empty title="No phrases yet" />
      )}
    </div>
  );
}

function MeasureTab() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const list = MEASURE_WORDS.filter((m) => !query || m.mw.includes(query) || m.py.toLowerCase().includes(query) || m.usage.toLowerCase().includes(query));

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input className="input pl-10" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search measure word or usage…" aria-label="Search measure words" />
      </div>
      {list.length === 0 ? (
        <Empty title="No measure words match" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((m) => (
            <div key={m.mw} className="card p-4">
              <div className="flex items-baseline gap-3">
                <span className="hanzi text-4xl">{m.mw}</span>
                <span className="text-accent">{m.py}</span>
              </div>
              <p className="mt-2 text-sm">{m.usage}</p>
              <ul className="mt-3 space-y-2">
                {m.examples.map((ex) => (
                  <li key={ex.zh} className="flex items-start gap-2">
                    <SpeakButton text={ex.zh} size="sm" rate={0.85} />
                    <div className="min-w-0">
                      <p className="han">{ex.zh}</p>
                      <p className="text-xs text-muted">{ex.en}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EtiquetteTab() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ETIQUETTE.map((t) => (
        <div key={t.title} className="card p-4">
          <h3 className="font-semibold">{t.title}</h3>
          <p className="mt-1 text-sm text-muted">{t.body}</p>
        </div>
      ))}
      {ETIQUETTE.length === 0 && <Empty title="No tips yet" />}
    </div>
  );
}
