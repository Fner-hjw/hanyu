"use client";

import { useMemo } from "react";
import { PageHeader, Stat } from "@/components/ui";
import { HSK_LEVELS, LEVEL_SIZES, levelLabel, levelOfId } from "@/lib/levels";
import { VOCAB } from "@/data/vocab";
import { ALL_GRAMMAR } from "@/data/grammar-all";
import { ALL_DIALOGUES } from "@/data/dialogues-all";
import { READINGS } from "@/data/readings";
import { isKnown, streak, todayKey, updateSettings, useAppState, useHydrated, type AppState } from "@/lib/store";

type Log = AppState["log"];

const WEEKS = 18;

// ---------- pure helpers (date math lives outside the component) ----------
const activity = (log: Log, k: string) => (log[k]?.reviews ?? 0) + (log[k]?.practice ?? 0);

function parseKey(k: string): number {
  const [y, m, d] = k.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function longestStreak(log: Log): number {
  const days = Object.keys(log).filter((k) => activity(log, k) > 0).sort();
  let best = 0;
  let run = 0;
  let prev = 0;
  for (const k of days) {
    const t = parseKey(k);
    run = prev && t - prev === 86400000 ? run + 1 : 1;
    prev = t;
    if (run > best) best = run;
  }
  return best;
}

function lastDays(n: number): string[] {
  const d = new Date();
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
    out.push(todayKey(x));
  }
  return out;
}

/** columns of 7 cells (Mon..Sun); null for days in the future */
function heatGrid(): (string | null)[][] {
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // Monday = 0
  const cols: (string | null)[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    const col: (string | null)[] = [];
    for (let r = 0; r < 7; r++) {
      const off = (WEEKS - 1 - w) * 7 + (dow - r);
      col.push(off < 0 ? null : todayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - off)));
    }
    cols.push(col);
  }
  return cols;
}

function daysUntil(date: string): number {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((parseKey(date) - today) / 86400000);
}

function intensity(v: number, max: number): number {
  if (v <= 0) return 0;
  const r = v / max;
  return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1;
}
const OPACITY = [0, 0.3, 0.5, 0.75, 1];

const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export default function StatsPage() {
  const hydrated = useHydrated();
  return hydrated ? <Stats /> : null;
}

function Stats() {
  const s = useAppState();

  const d = useMemo(() => {
    const logKeys = Object.keys(s.log);
    const totalReviews = logKeys.reduce((a, k) => a + (s.log[k].reviews ?? 0), 0);
    const totalPractice = logKeys.reduce((a, k) => a + (s.log[k].practice ?? 0), 0);
    const knownSet = new Set([...Object.keys(s.cards).filter((id) => isKnown(s.cards[id])), ...Object.keys(s.known)]);
    const days30 = lastDays(30);
    const rev30 = days30.reduce((a, k) => a + (s.log[k]?.reviews ?? 0), 0);
    const cor30 = days30.reduce((a, k) => a + (s.log[k]?.correct ?? 0), 0);
    const retention = rev30 ? Math.round((cor30 / rev30) * 100) : null;
    const grid = heatGrid();
    const max = Math.max(1, ...grid.flat().map((k) => (k ? activity(s.log, k) : 0)));
    const days14 = lastDays(14).map((k) => ({ k, reviews: s.log[k]?.reviews ?? 0, practice: s.log[k]?.practice ?? 0 }));
    return {
      totalReviews, totalPractice, known: knownSet.size, retention, rev30,
      longest: longestStreak(s.log), current: streak(s), grid, max, days14,
    };
  }, [s]);

  const levels = useMemo(() => {
    const cardIds = Object.keys(s.cards);
    const knownIds = Object.keys(s.known);
    const rows = HSK_LEVELS.map((l) => {
      const started = new Set([...cardIds, ...knownIds].filter((id) => levelOfId(id) === l));
      const known = new Set([...cardIds.filter((id) => isKnown(s.cards[id])), ...knownIds].filter((id) => levelOfId(id) === l));
      return { name: levelLabel(l), started: started.size, known: known.size, total: LEVEL_SIZES[l] };
    });
    const bizIds = new Set(VOCAB.map((w) => w.id));
    const bizStarted = new Set([...cardIds, ...knownIds].filter((id) => bizIds.has(id)));
    const bizKnown = new Set([...cardIds.filter((id) => isKnown(s.cards[id])), ...knownIds].filter((id) => bizIds.has(id)));
    rows.push({ name: "Business", started: bizStarted.size, known: bizKnown.size, total: VOCAB.length });
    return rows;
  }, [s.cards, s.known]);

  const { targetLevel, examDate, newPerDay } = s.settings;
  const plan = useMemo(() => {
    const started = new Set([...Object.keys(s.cards), ...Object.keys(s.known)].filter((id) => {
      const l = levelOfId(id);
      return l >= 1 && l <= targetLevel;
    }));
    let total = 0;
    for (let l = 1; l <= targetLevel; l++) total += LEVEL_SIZES[l];
    const needed = Math.max(0, total - started.size);
    const raw = examDate ? daysUntil(examDate) : null;
    const days = raw !== null && raw > 0 ? raw : null;
    const perDay = days ? Math.ceil(needed / days) : null;
    return { needed, days, past: raw !== null && raw <= 0, perDay, daysAtCurrent: Math.ceil(needed / Math.max(1, newPerDay)) };
  }, [s.cards, s.known, targetLevel, examDate, newPerDay]);

  const dialogueScores = Object.values(s.dialoguesDone);
  const readingScores = Object.values(s.readingsDone);
  const writing = Object.values(s.writing);
  const lastTest = s.tests[s.tests.length - 1];
  const recommended = plan.perDay === null ? null : clamp(plan.perDay, 5, 100);

  return (
    <div className="space-y-8">
      <PageHeader title="Progress" subtitle="Your streaks, activity, vocabulary and skills at a glance, plus a study plan for your target level." />

      <section aria-label="Key numbers" className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Current streak" value={d.current} sub={d.current === 1 ? "day" : "days"} />
        <Stat label="Longest streak" value={d.longest} sub={d.longest === 1 ? "day" : "days"} />
        <Stat label="Total reviews" value={d.totalReviews.toLocaleString()} sub="flashcards" />
        <Stat label="Practice items" value={d.totalPractice.toLocaleString()} sub="listening, speaking, writing…" />
        <Stat label="Words known" value={d.known.toLocaleString()} sub="stable or marked" />
        <Stat label="Retention" value={d.retention === null ? "—" : `${d.retention}%`} sub={`last 30 days · ${d.rev30} reviews`} />
      </section>

      <section className="card p-5">
        <h2 className="mb-1 font-semibold">Activity</h2>
        <p className="mb-3 text-xs text-muted">Reviews + practice per day, last {WEEKS} weeks (weeks start Monday).</p>
        <div className="noscroll overflow-x-auto" role="img" aria-label={`Activity heatmap for the last ${WEEKS} weeks`}>
          <div className="flex gap-1" style={{ width: "max-content" }}>
            {d.grid.map((col, i) => (
              <div key={i} className="flex flex-col gap-1">
                {col.map((k, j) => {
                  if (!k) return <div key={j} className="h-3.5 w-3.5" />;
                  const v = activity(s.log, k);
                  const step = intensity(v, d.max);
                  return step === 0
                    ? <div key={j} title={`${k}: ${v}`} className="h-3.5 w-3.5 rounded-[3px] bg-line" />
                    : <div key={j} title={`${k}: ${v}`} className="h-3.5 w-3.5 rounded-[3px] bg-accent" style={{ opacity: OPACITY[step] }} />;
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
          Less
          <span className="h-3 w-3 rounded-[3px] bg-line" />
          {[1, 2, 3, 4].map((i) => <span key={i} className="h-3 w-3 rounded-[3px] bg-accent" style={{ opacity: OPACITY[i] }} />)}
          More
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Last 14 days</h2>
          <div className="flex gap-3 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--accent)" }} />Reviews</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--gold)" }} />Practice</span>
          </div>
        </div>
        <BarChart days={d.days14} />
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-semibold">Vocabulary by level</h2>
        <div className="space-y-3">
          {levels.map((r) => (
            <div key={r.name}>
              <div className="mb-1 flex flex-wrap justify-between gap-x-3 text-sm">
                <span className="font-medium">{r.name}</span>
                <span className="text-muted">{r.known} known · {r.started} started · {r.total.toLocaleString()} total</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-line" role="img" aria-label={`${r.name}: ${r.known} known, ${r.started} started of ${r.total}`}>
                <div className="absolute inset-y-0 left-0 rounded-full bg-sky" style={{ width: `${Math.min(100, (r.started / r.total) * 100)}%`, opacity: 0.45 }} />
                <div className="absolute inset-y-0 left-0 rounded-full bg-good" style={{ width: `${Math.min(100, (r.known / r.total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-good" />Known</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-sky" style={{ opacity: 0.45 }} />Started</span>
        </div>
      </section>

      <section aria-label="Skills" className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Grammar" value={Object.keys(s.grammarDone).length} sub={`of ${ALL_GRAMMAR.length} points studied`} />
        <Stat label="Dialogues" value={dialogueScores.length} sub={`of ${ALL_DIALOGUES.length} · avg best ${avg(dialogueScores)}%`} />
        <Stat label="Readings" value={readingScores.length} sub={`of ${READINGS.length} · avg ${avg(readingScores)}%`} />
        <Stat label="Characters" value={writing.length} sub={`written · ${writing.filter((v) => v >= 80).length} at 80%+`} />
        <Stat label="Tests" value={s.tests.length} sub={lastTest ? `last estimate HSK ${lastTest.estimated}` : "none taken yet"} />
        <Stat label="Open mistakes" value={Object.keys(s.mistakes).length} sub="to revisit" />
      </section>

      <section className="card p-5">
        <h2 className="mb-1 font-semibold">Study plan</h2>
        <p className="mb-4 text-sm text-muted">Pick a target level and an optional exam date to see how many new words a day you need.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="eyebrow">Target HSK level</span>
            <select className="input mt-1" value={targetLevel} onChange={(e) => updateSettings({ targetLevel: +e.target.value })}>
              {[1, 2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>HSK {l}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow">Exam / target date</span>
            <input type="date" className="input mt-1" value={examDate} onChange={(e) => updateSettings({ examDate: e.target.value })} />
          </label>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="card-flat p-3">
            <div className="eyebrow">Words still needed</div>
            <div className="mt-1 text-2xl font-bold">{plan.needed.toLocaleString()}</div>
            <div className="text-xs text-muted">to reach HSK {targetLevel}</div>
          </div>
          <div className="card-flat p-3">
            <div className="eyebrow">Days left</div>
            <div className="mt-1 text-2xl font-bold">{plan.days ?? "—"}</div>
            <div className="text-xs text-muted">{plan.days ? "until your date" : plan.past ? "that date has passed" : "no date set"}</div>
          </div>
        </div>

        {plan.perDay !== null && recommended !== null ? (
          <div className="mt-4 space-y-2 text-sm">
            <p>Recommended: <b>{plan.perDay}</b> new words per day (currently {newPerDay}).</p>
            <p className="text-muted">Estimated daily review load ≈ {plan.perDay * 5} cards. This is a rough FSRS rule of thumb: about five reviews per new word per day in steady state.</p>
            {plan.perDay > 100 && <p className="text-accent">That is above the 100/day cap, so the date may be out of reach at this level.</p>}
            <button className="btn btn-primary btn-sm" disabled={recommended === newPerDay} onClick={() => updateSettings({ newPerDay: recommended })}>
              Use {recommended} new words per day
            </button>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            {plan.needed === 0
              ? "You have already started every word up to this level."
              : <>At your current {newPerDay} new words per day it would take about <b className="text-fg">{plan.daysAtCurrent}</b> days. Set a date for a tailored recommendation.</>}
          </p>
        )}
      </section>
    </div>
  );
}

function BarChart({ days }: { days: { k: string; reviews: number; practice: number }[] }) {
  const W = 560;
  const H = 160;
  const pad = { l: 28, r: 4, t: 8, b: 22 };
  const max = Math.max(5, ...days.map((x) => x.reviews + x.practice));
  const plotH = H - pad.t - pad.b;
  const slot = (W - pad.l - pad.r) / days.length;
  const bw = slot * 0.6;
  const total = days.reduce((a, x) => a + x.reviews + x.practice, 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
      aria-label={`Reviews and practice per day over the last 14 days, ${total} items in total`}>
      {[0, 0.5, 1].map((f) => {
        const y = pad.t + plotH * (1 - f);
        return (
          <g key={f}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--line)" strokeWidth={1} />
            <text x={pad.l - 4} y={y + 3} textAnchor="end" fontSize={9} fill="var(--muted)">{Math.round(max * f)}</text>
          </g>
        );
      })}
      {days.map((x, i) => {
        const cx = pad.l + slot * i + slot / 2;
        const hr = (x.reviews / max) * plotH;
        const hp = (x.practice / max) * plotH;
        const base = pad.t + plotH;
        return (
          <g key={x.k}>
            <title>{`${x.k}: ${x.reviews} reviews, ${x.practice} practice`}</title>
            <rect x={cx - bw / 2} y={base - hr} width={bw} height={hr} rx={2} fill="var(--accent)" />
            <rect x={cx - bw / 2} y={base - hr - hp} width={bw} height={hp} rx={2} fill="var(--gold)" />
            <rect x={cx - slot / 2} y={pad.t} width={slot} height={plotH} fill="transparent" />
            {i % 2 === 1 || i === days.length - 1 ? null : (
              <text x={cx} y={H - 6} textAnchor="middle" fontSize={9} fill="var(--muted)">{x.k.slice(5)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
