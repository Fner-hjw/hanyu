"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Ear, Info, Keyboard, Layers, PenLine, Quote, Repeat } from "lucide-react";
import { Rating, type Grade } from "ts-fsrs";
import { BIZ_WORDS, DECKS, LEVEL_SIZES, levelLabel, OFFLINE_MISSING, sentenceAudio, type Word } from "@/lib/data";
import { deckCounts, planSession } from "@/lib/resolve";
import { checkPinyin } from "@/lib/pinyin";
import { playUrl, speak, stopAll } from "@/lib/audio";
import {
  addMistake, clearMistake, dueCount, previewIntervals, reviewCard, todayKey, updateSettings, useAppState, useHydrated, type AppState,
} from "@/lib/store";
import { Badge, Empty, PageHeader, Progress } from "@/components/ui";
import { SpeakButton } from "@/components/Speak";
import { WordSheet } from "@/components/WordSheet";

type Mode = AppState["settings"]["direction"];
const MODES: { id: Mode; label: string; icon: typeof Layers; desc: string }[] = [
  { id: "zh-en", label: "Recognise", icon: Layers, desc: "See 汉字, recall the meaning" },
  { id: "en-zh", label: "Recall", icon: Repeat, desc: "See English, produce the Chinese" },
  { id: "listen", label: "Listen", icon: Ear, desc: "Hear it, recall the meaning" },
  { id: "type", label: "Type pinyin", icon: Keyboard, desc: "Type the reading — auto-graded" },
  { id: "cloze", label: "Cloze", icon: Quote, desc: "Fill the gap in a real sentence" },
];

export default function Page() {
  return <Suspense fallback={null}><Flashcards /></Suspense>;
}

function Flashcards() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const [deck, setDeck] = useState<string | null>(params.get("deck"));
  if (!hydrated) return null;
  return deck ? <SessionLoader key={deck} deck={deck} onExit={() => setDeck(null)} /> : <Picker onPick={setDeck} />;
}

/* ---------------- deck picker ---------------- */
function Picker({ onPick }: { onPick: (d: string) => void }) {
  const s = useAppState();
  const allDue = dueCount(s);
  const mistakes = Object.keys(s.mistakes).length;
  const bank = Object.keys(s.bank).length;
  const room = Math.max(0, s.settings.newPerDay - (s.log[todayKey()]?.newCards ?? 0));
  const hsk = DECKS.filter((d) => d.kind === "hsk");
  const biz = DECKS.filter((d) => d.kind === "biz");

  return (
    <div>
      <PageHeader title="Review" subtitle="Spaced repetition (FSRS) schedules every word right before you'd forget it. Pick a deck and a study mode." />

      <section className="card mb-6 p-5">
        <div className="eyebrow mb-3">Study mode</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {MODES.map(({ id, label, icon: Icon, desc }) => (
            <button key={id} onClick={() => updateSettings({ direction: id })}
              className={`rounded-xl border p-3 text-left transition-colors ${s.settings.direction === id ? "border-accent bg-accent-soft" : "border-line hover:bg-card2"}`}>
              <Icon size={18} className="text-accent" />
              <div className="mt-1 text-sm font-semibold">{label}</div>
              <div className="text-[0.7rem] leading-tight text-muted">{desc}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={s.settings.showPinyin} onChange={(e) => updateSettings({ showPinyin: e.target.checked })} /> Pinyin on the front</label>
          <span className="text-muted">New words left today: <b className="text-fg">{room}</b> / {s.settings.newPerDay}</span>
        </div>
      </section>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <button className="card p-4 text-left hover:-translate-y-0.5 disabled:opacity-50" disabled={!allDue} onClick={() => onPick("due")}>
          <div className="eyebrow">All decks</div><div className="mt-1 text-2xl font-bold">{allDue}</div><div className="text-sm text-muted">cards due now</div>
        </button>
        <button className="card p-4 text-left hover:-translate-y-0.5 disabled:opacity-50" disabled={!mistakes} onClick={() => onPick("mistakes")}>
          <div className="eyebrow">Mistakes</div><div className="mt-1 text-2xl font-bold">{mistakes}</div><div className="text-sm text-muted">words you got wrong</div>
        </button>
        <button className="card p-4 text-left hover:-translate-y-0.5 disabled:opacity-50" disabled={!bank} onClick={() => onPick("bank")}>
          <div className="eyebrow">My word bank</div><div className="mt-1 text-2xl font-bold">{bank}</div><div className="text-sm text-muted">saved from reading</div>
        </button>
      </div>

      <h2 className="mb-3 font-semibold">HSK decks</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {hsk.map((d) => {
          const c = deckCounts(s, d.id, LEVEL_SIZES[d.level!]);
          return (
            <button key={d.id} onClick={() => onPick(d.id)} className="card p-4 text-left hover:-translate-y-0.5">
              <div className="font-semibold">{d.title}</div>
              <div className="text-xs text-muted">{d.subtitle}</div>
              <div className="mt-3 flex gap-1.5">{c.due > 0 && <Badge tone="accent">{c.due} due</Badge>}<Badge>{c.unseen.toLocaleString()} new</Badge></div>
            </button>
          );
        })}
      </div>

      <h2 className="mb-3 font-semibold">Business &amp; finance</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {biz.map((d) => {
          const ids = (d.topic ? BIZ_WORDS.filter((w) => w.topic === d.topic) : BIZ_WORDS).map((w) => w.id);
          const c = deckCounts(s, d.id, ids.length, ids);
          return (
            <button key={d.id} onClick={() => onPick(d.id)} className="card p-4 text-left hover:-translate-y-0.5">
              <div className="font-semibold">{d.title}</div>
              <div className="text-xs text-muted">{d.subtitle}</div>
              <div className="mt-3 flex gap-1.5">{c.due > 0 && <Badge tone="accent">{c.due} due</Badge>}<Badge>{c.unseen} new</Badge></div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- session ---------------- */
function deckTitle(deck: string) {
  const u = /^unit-(\d)-(\d+)$/.exec(deck);
  if (u) return `${levelLabel(+u[1])} · Unit ${u[2]}`;
  return ({ due: "All due cards", mistakes: "Mistakes", bank: "My word bank" } as Record<string, string>)[deck] ?? DECKS.find((d) => d.id === deck)?.title ?? deck;
}

function SessionLoader({ deck, onExit }: { deck: string; onExit: () => void }) {
  const [plan, setPlan] = useState<Awaited<ReturnType<typeof planSession>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    // snapshot the state once: the queue shouldn't reshuffle while we review
    import("@/lib/store").then(({ getState }) => planSession(deck, getState())).then((p) => live && setPlan(p), (e) => live && setError(String(e)));
    return () => { live = false; };
  }, [deck]);
  if (error) return <p className="text-accent">{error === OFFLINE_MISSING ? error : `Couldn’t load deck: ${error}`}</p>;
  if (!plan) return <p className="text-muted">Preparing your session…</p>;
  return <Session deck={deck} plan={plan} onExit={onExit} />;
}

function Session({ deck, plan, onExit }: { deck: string; plan: Awaited<ReturnType<typeof planSession>>; onExit: () => void }) {
  const s = useAppState();
  const mode = s.settings.direction;
  const [queue, setQueue] = useState(plan.queue);
  const [flipped, setFlipped] = useState(false);
  const [typed, setTyped] = useState("");
  const [verdict, setVerdict] = useState<"exact" | "tones" | "wrong" | null>(null);
  const [stats, setStats] = useState({ done: 0, good: 0, again: 0 });
  const [details, setDetails] = useState<Word | null>(null);
  const [started] = useState(() => new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  const w = queue[0] ? plan.words.get(queue[0]) : undefined;
  const ex = w?.ex.find((e) => e.zh.includes(w.zh));
  const effMode: Mode = mode === "cloze" && !ex ? "en-zh" : mode;

  const playWord = useCallback((word: Word) => speak(word.zh, Math.min(s.settings.speed, 0.85)), [s.settings.speed]);

  // listening mode: play on show
  useEffect(() => {
    if (w && effMode === "listen" && !flipped) playWord(w);
  }, [w, effMode, flipped, playWord]);
  useEffect(() => { if (effMode === "type" && !flipped) inputRef.current?.focus(); }, [w, effMode, flipped]);

  const reveal = useCallback(() => {
    if (!w || flipped) return;
    if (effMode === "type") {
      const v = typed.trim() ? checkPinyin(typed, w.py) : "wrong";
      setVerdict(v);
    }
    setFlipped(true);
    if (ex?.id) playUrl(sentenceAudio(ex.id), ex.zh); else playWord(w);
  }, [w, flipped, effMode, typed, ex, playWord]);

  const rate = useCallback((g: Grade) => {
    if (!w) return;
    stopAll();
    reviewCard(w.id, g);
    if (g === Rating.Again) addMistake(w.id, "word"); else if (g >= Rating.Good) clearMistake(w.id);
    setStats((x) => ({ done: x.done + 1, good: x.good + (g >= Rating.Good ? 1 : 0), again: x.again + (g === Rating.Again ? 1 : 0) }));
    setFlipped(false); setTyped(""); setVerdict(null);
    setQueue((q) => (g === Rating.Again ? [...q.slice(1, 4), q[0], ...q.slice(4)] : q.slice(1)));
  }, [w]);

  const suggested: Grade | null = verdict === "exact" ? Rating.Good : verdict === "tones" ? Rating.Hard : verdict === "wrong" ? Rating.Again : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (details) return;
      const inInput = (e.target as HTMLElement)?.tagName === "INPUT";
      if (!flipped && (e.key === "Enter" || (e.key === " " && !inInput))) { e.preventDefault(); reveal(); return; }
      if (flipped) {
        if (e.key === "Enter" && suggested) { e.preventDefault(); rate(suggested); }
        else if (["1", "2", "3", "4"].includes(e.key)) rate(+e.key as Grade);
        else if (e.key === " ") { e.preventDefault(); rate(Rating.Good); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, reveal, rate, suggested, details]);

  const preview = useMemo(() => (flipped && w ? previewIntervals(w.id, s) : null), [flipped, w, s]);

  if (!w) {
    const mins = Math.max(1, Math.round((new Date().getTime() - started.getTime()) / 60000));
    return (
      <div className="mx-auto max-w-lg">
        {stats.done === 0 ? (
          <Empty title="Nothing to study in this deck right now">All caught up. Try another deck or raise your daily new-word limit on the Today page.</Empty>
        ) : (
          <div className="card pop p-8 text-center">
            <div className="hanzi text-5xl text-accent">太棒了！</div>
            <p className="mt-3 text-lg font-semibold">{stats.done} reviews in {mins} min</p>
            <p className="text-muted">{Math.round((stats.good / stats.done) * 100)}% remembered · {stats.again} sent back for another look</p>
          </div>
        )}
        <div className="mt-4 flex justify-center gap-2">
          <button className="btn btn-primary" onClick={onExit}>Choose another deck</button>
          <Link href="/" className="btn">Today</Link>
        </div>
      </div>
    );
  }

  const remaining = queue.length;
  const total = plan.queue.length;
  const blanked = ex ? ex.zh.replace(w.zh, "＿".repeat([...w.zh].length)) : "";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center gap-3 text-sm">
        <button onClick={onExit} className="flex items-center gap-1 text-muted hover:text-fg"><ArrowLeft size={15} /> Decks</button>
        <span className="font-semibold">{deckTitle(deck)}</span>
        <span className="ml-auto text-muted">{remaining} left</span>
      </div>
      <Progress value={((total - Math.min(total, remaining)) / Math.max(1, total)) * 100} className="mb-4" />

      <div className="card relative min-h-[18rem] p-6 sm:p-8" onClick={() => effMode !== "type" && !flipped && reveal()}>
        {!s.cards[w.id] && <span className="absolute left-4 top-4"><Badge tone="gold">New</Badge></span>}
        <button className="absolute right-4 top-4 rounded-full p-1.5 text-muted hover:bg-accent-soft" aria-label="Word details" onClick={(e) => { e.stopPropagation(); setDetails(w); }}><Info size={18} /></button>

        {/* front */}
        <div className="flex flex-col items-center justify-center gap-3 pt-6 text-center">
          {(effMode === "zh-en" || effMode === "type") && (
            <>
              <div className="hanzi text-7xl leading-tight">{w.zh}</div>
              {s.settings.showPinyin && effMode !== "type" && !flipped && <div className="text-xl text-accent">{w.py}</div>}
              {effMode !== "type" && <SpeakButton text={w.zh} rate={0.8} />}
            </>
          )}
          {effMode === "en-zh" && !flipped && <div className="max-w-md text-2xl font-semibold">{w.en || "(no definition)"}</div>}
          {effMode === "listen" && !flipped && (<><div className="text-sm text-muted">Listen and recall the meaning</div><SpeakButton text={w.zh} rate={0.8} size="lg" /></>)}
          {effMode === "cloze" && !flipped && ex && (
            <><div className="han max-w-lg text-2xl leading-relaxed">{blanked}</div><div className="text-sm text-muted">{ex.en}</div><div className="text-xs text-muted">Which word fills the gap? ({w.en})</div></>
          )}
          {effMode === "type" && !flipped && (
            <form className="mt-2 w-full max-w-xs" onSubmit={(e) => { e.preventDefault(); reveal(); }}>
              <input ref={inputRef} className="input text-center text-lg" value={typed} onChange={(e) => setTyped(e.target.value)}
                placeholder="pinyin, e.g. yin2hang2" autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Type the pinyin" />
              <div className="mt-1 text-[0.7rem] text-muted">Tone numbers or marks; leave tones off if unsure</div>
            </form>
          )}
          {!flipped && effMode !== "type" && <div className="mt-6 text-xs text-muted">Tap or press Space to reveal</div>}
        </div>

        {/* back */}
        {flipped && (
          <div className="pop mt-4 border-t border-line pt-5 text-center">
            {effMode !== "zh-en" && effMode !== "type" && <div className="hanzi text-6xl leading-tight">{w.zh}</div>}
            {verdict && (
              <div className={`mb-2 text-sm font-semibold ${verdict === "exact" ? "text-good" : verdict === "tones" ? "text-gold" : "text-accent"}`}>
                {verdict === "exact" ? "✓ Correct" : verdict === "tones" ? "Letters right — check the tones" : `✗ You typed “${typed || "nothing"}”`}
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-xl text-accent">{w.py} <SpeakButton text={w.zh} rate={0.8} size="sm" /></div>
            <div className="mt-1 text-xl">{w.en}</div>
            {w.pos.length > 0 && <div className="mt-1 text-xs text-muted">{w.pos.join(" · ")}</div>}
            {ex && (
              <div className="mx-auto mt-4 max-w-md rounded-xl bg-card2 p-3 text-left">
                <div className="flex items-start gap-2">
                  <SpeakButton text={ex.zh} src={ex.id ? sentenceAudio(ex.id) : undefined} size="sm" />
                  <div><div className="han text-lg">{ex.zh}</div>{ex.py && <div className="text-xs text-muted">{ex.py}</div>}<div className="text-sm text-muted">{ex.en}</div></div>
                </div>
              </div>
            )}
            {s.notes[w.id] && <div className="mx-auto mt-3 max-w-md text-left text-sm"><PenLine size={13} className="mr-1 inline text-muted" />{s.notes[w.id]}</div>}
          </div>
        )}
      </div>

      {flipped ? (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {([[Rating.Again, "Again", "1"], [Rating.Hard, "Hard", "2"], [Rating.Good, "Good", "3"], [Rating.Easy, "Easy", "4"]] as [Grade, string, string][]).map(([g, label, key]) => (
            <button key={label} onClick={() => rate(g)}
              className={`rounded-2xl border bg-card py-3 transition-colors hover:bg-accent-soft ${suggested === g ? "border-accent ring-2 ring-accent/30" : "border-line"}`}>
              <div className="font-semibold">{label}</div>
              <div className="text-xs text-muted">{preview?.[g]} <span className="hidden sm:inline">· {key}</span></div>
            </button>
          ))}
        </div>
      ) : (
        <button onClick={reveal} className="btn btn-primary mt-4 w-full py-3">{effMode === "type" ? "Check" : "Show answer"}</button>
      )}
      <p className="mt-3 hidden text-center text-xs text-muted sm:block">Shortcuts: Space/Enter reveal · 1–4 rate · Enter accepts the suggested rating</p>
      <WordSheet word={details} onClose={() => setDetails(null)} />
    </div>
  );
}
