"use client";

import Link from "next/link";
import { ArrowRight, Flame, Layers, Sparkles, Target, Trophy } from "lucide-react";
import { PageHeader, Progress, Ring, Stat, plural } from "@/components/ui";
import { HSK_LEVELS, LEVEL_SIZES, levelLabel, levelOfId, BIZ_WORDS } from "@/lib/data";
import { visibleNav } from "@/lib/nav";
import { dueCount, isKnown, streak, todayKey, updateSettings, useAppState, useHydrated } from "@/lib/store";

export default function Home() {
  const hydrated = useHydrated();
  return hydrated ? <Today /> : null;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Today() {
  const s = useAppState();
  const ids = Object.keys(s.cards);
  const due = dueCount(s);
  const log = s.log[todayKey()];
  const done = (log?.reviews ?? 0) + (log?.practice ?? 0);
  const goal = s.settings.dailyGoal;
  const pct = Math.min(100, (done / goal) * 100);
  const known = new Set([...ids.filter((id) => isKnown(s.cards[id])), ...Object.keys(s.known)]).size;
  const last = s.tests.filter((t) => t.kind !== "speaking").at(-1);
  const days = streak(s);

  const perLevel = HSK_LEVELS.map((l) => {
    const started = ids.filter((id) => levelOfId(id) === l).length;
    const marked = Object.keys(s.known).filter((id) => levelOfId(id) === l && !s.cards[id]).length;
    return { l, n: started + marked, total: LEVEL_SIZES[l] };
  });
  const bizStarted = ids.filter((id) => id.startsWith("w")).length;
  const practiceLinks = visibleNav().filter((n) => n.group === "Practice");

  return (
    <div className="space-y-8">
      <PageHeader title={<>{greeting()} <span className="hanzi text-accent">你好</span></>} subtitle="A little every day beats a lot once a week. Here's your plan." />

      <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="card flex items-center gap-4 p-5 sm:gap-6">
          <Ring value={pct} size={104} stroke={10}>
            <span className="text-2xl font-bold">{done}</span>
            <span className="text-[0.7rem] text-muted">of {goal} today</span>
          </Ring>
          <div className="flex-1">
            <div className="eyebrow">Today&apos;s goal</div>
            <p className="mt-1 text-lg font-semibold">
              {pct >= 100 ? "Goal complete — wonderful! 太棒了" : due > 0 ? `${due} card${due === 1 ? "" : "s"} waiting for review` : "Start with a few new words"}
            </p>
            <p className="text-sm text-muted">Reviews and practice both count toward your streak.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/flashcards" className="btn btn-primary"><Layers size={16} /> {due > 0 ? "Review now" : "Learn new words"}</Link>
              <Link href="/learn" className="btn">Continue the path</Link>
              {Object.keys(s.mistakes).length > 0 && <Link href="/mistakes" className="btn">{plural(Object.keys(s.mistakes).length, "mistake")} to revisit</Link>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Streak" value={days} sub={days === 1 ? "day" : "days"} icon={<Flame size={16} className={days ? "text-gold" : ""} />} />
          <Stat label="Known" value={known} sub="words" icon={<Trophy size={16} />} />
          <Stat label="Due" value={due} sub="cards" icon={<Target size={16} />} />
          <Stat label="Started" value={ids.length} sub="words" icon={<Sparkles size={16} />} />
        </div>
      </section>

      {practiceLinks.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Practise a skill</h2>
          <div className="noscroll -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
            {practiceLinks.map(({ href, label, desc, icon: Icon }) => (
              <Link key={href} href={href} className="card group min-w-[10.5rem] shrink-0 p-4 transition-transform hover:-translate-y-0.5 sm:min-w-0">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent"><Icon size={20} /></span>
                <div className="font-semibold">{label}</div>
                <div className="mt-0.5 line-clamp-2 text-xs text-muted">{desc}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Vocabulary by level</h2>
            <Link href="/vocab" className="flex items-center gap-1 text-sm text-accent">Browse <ArrowRight size={14} /></Link>
          </div>
          <div className="space-y-3">
            <p className="-mt-1 text-xs text-muted">Words started out of the new words at each level. Running totals follow the revised HSK syllabus (November 2025).</p>
            {perLevel.map(({ l, n, total }, i) => (
              <div key={l}>
                <div className="mb-1 flex justify-between gap-2 text-sm">
                  <span className="font-medium">{levelLabel(l)}</span>
                  <span className="text-muted">{n} / {total.toLocaleString()} new · {perLevel.slice(0, i + 1).reduce((a, x) => a + x.total, 0).toLocaleString()} in total</span>
                </div>
                <Progress value={(n / total) * 100} tone={l <= 2 ? "good" : l <= 4 ? "sky" : "accent"} />
              </div>
            ))}
            <div>
              <div className="mb-1 flex justify-between text-sm"><span className="font-medium">Business &amp; finance</span><span className="text-muted">{bizStarted} / {BIZ_WORDS.length}</span></div>
              <Progress value={(bizStarted / BIZ_WORDS.length) * 100} tone="gold" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="mb-3 font-semibold">Level check</h2>
            {last ? (
              <div className="flex items-center justify-between">
                <div><div className="text-3xl font-bold text-accent">≈ HSK {last.estimated}</div><div className="text-xs text-muted">{new Date(last.date).toLocaleDateString()}</div></div>
                <Link href="/test" className="btn btn-sm">Retake</Link>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted">Not sure where you stand? A 15-minute check estimates your HSK level.</p>
                <Link href="/test" className="btn btn-sm btn-primary shrink-0">Start</Link>
              </div>
            )}
          </div>
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Progress</h2><Link href="/stats" className="flex items-center gap-1 text-sm text-accent">Details <ArrowRight size={14} /></Link></div>
            <dl className="grid grid-cols-3 gap-3">
              {[
                ["Dialogues", Object.keys(s.dialoguesDone).length, "done"],
                ["Grammar", Object.keys(s.grammarDone).length, "studied"],
                ["Characters", Object.keys(s.writing).length, "written"],
              ].map(([label, n, verb]) => (
                <div key={label}>
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="text-2xl font-bold tracking-tight">{n}</dd>
                  <dd className="text-xs text-muted">{verb}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <details className="card p-5 text-sm">
        <summary className="cursor-pointer font-semibold">Settings &amp; backup</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="eyebrow">New cards per day</span>
            <select className="input mt-1" value={s.settings.newPerDay} onChange={(e) => updateSettings({ newPerDay: +e.target.value })}>
              {[5, 10, 15, 20, 30, 50].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow">Daily goal (reviews + practice)</span>
            <select className="input mt-1" value={s.settings.dailyGoal} onChange={(e) => updateSettings({ dailyGoal: +e.target.value })}>
              {[10, 20, 30, 50, 80, 120].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <p className="mt-4 text-sm text-muted">
          Backup, restore and cross-device sync are under <Link href="/account" className="font-semibold text-accent">Account</Link>.
        </p>
      </details>
    </div>
  );
}
