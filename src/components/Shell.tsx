"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ellipsis, Flame, UserRound, CalendarCheck, Layers, Route, LayoutGrid } from "lucide-react";
import { NAV, visibleNav } from "@/lib/nav";
import { useSync } from "./SyncProvider";
import { streak, useAppState, useHydrated } from "@/lib/store";

const GROUPS = ["Learn", "Practice", "Tools"] as const;
const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));

function Seal({ size = 36 }: { size?: number }) {
  return (
    <span className="hanzi inline-flex items-center justify-center rounded-lg bg-accent font-bold text-accent-fg shadow-sm"
      style={{ width: size, height: size, fontSize: size * 0.58 }}>
      汉
    </span>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const s = useAppState();
  const hydrated = useHydrated();
  const { status } = useSync();
  const items = visibleNav();
  const days = hydrated ? streak(s) : 0;
  const dot = { synced: "bg-good", syncing: "bg-gold", error: "bg-accent", idle: "bg-line", "signed-out": "bg-line", off: "" }[status];

  const tabs = [
    { href: "/", label: "Today", icon: CalendarCheck },
    { href: items.some((i) => i.href === "/learn") ? "/learn" : "/vocab", label: items.some((i) => i.href === "/learn") ? "Path" : "Words", icon: Route },
    { href: "/flashcards", label: "Review", icon: Layers },
    { href: "/practice", label: "Practice", icon: LayoutGrid },
    { href: "/more", label: "More", icon: Ellipsis },
  ];

  return (
    <div className="lg:grid lg:grid-cols-[16.5rem_1fr]">
      {/* ---- desktop sidebar ---- */}
      <aside className="sticky top-0 hidden h-screen flex-col overflow-y-auto border-r border-line bg-card2/60 px-4 py-5 lg:flex">
        <Link href="/" className="mb-6 flex items-center gap-3 px-2">
          <Seal />
          <div className="leading-tight">
            <div className="text-[1.05rem] font-bold tracking-tight">Hànyǔ</div>
            <div className="text-xs text-muted">Chinese for life &amp; work</div>
          </div>
        </Link>
        <nav className="flex-1 space-y-5">
          {GROUPS.map((g) => {
            const gi = items.filter((n) => n.group === g);
            if (!gi.length) return null;
            return (
              <div key={g}>
                <div className="eyebrow mb-1.5 px-3">{g}</div>
                <ul className="space-y-0.5">
                  {gi.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link href={href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[0.92rem] font-medium transition-colors ${isActive(path, href) ? "bg-accent text-accent-fg shadow-sm" : "text-fg/80 hover:bg-accent-soft"}`}>
                        <Icon size={18} strokeWidth={2} />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
        <div className="mt-4 space-y-2 border-t border-line pt-4">
          <div className="flex items-center gap-2 px-3 text-sm">
            <Flame size={18} className={days ? "text-gold" : "text-muted"} />
            <span className="font-semibold">{days}</span>
            <span className="text-muted">day streak</span>
          </div>
          {status !== "off" && (
            <Link href="/account" className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${path.startsWith("/account") ? "bg-accent text-accent-fg" : "text-muted hover:bg-accent-soft"}`}>
              <UserRound size={18} /> Account
              <span className={`ml-auto h-2 w-2 rounded-full ${dot}`} />
            </Link>
          )}
        </div>
      </aside>

      {/* ---- main ---- */}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/85 px-4 py-2.5 backdrop-blur lg:hidden">
          <Link href="/" className="flex items-center gap-2"><Seal size={30} /><span className="font-bold">Hànyǔ</span></Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1"><Flame size={16} className={days ? "text-gold" : "text-muted"} /><b>{days}</b></span>
            {status !== "off" && <Link href="/account" aria-label="Account" className="relative"><UserRound size={20} /><span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${dot}`} /></Link>}
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 lg:px-8 lg:pb-12 lg:pt-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-24 text-xs text-muted lg:px-8 lg:pb-8">
          Data: HSK 3.1 syllabus · CC-CEDICT (CC BY-SA 4.0) · HSK sentences &amp; audio by no7z (CC BY-SA 4.0) · Wikimedia CCD.
        </footer>
      </div>

      {/* ---- mobile tab bar ---- */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Main">
        {tabs.map(({ href, label, icon: Icon }) => {
          const group = label === "Practice" ? NAV.filter((n) => n.group === "Practice").some((n) => isActive(path, n.href)) : label === "More" ? NAV.filter((n) => n.group === "Tools").some((n) => isActive(path, n.href)) || path.startsWith("/account") : isActive(path, href);
          return (
            <Link key={label} href={href} className={`flex flex-col items-center gap-0.5 py-2.5 text-[0.68rem] font-semibold ${group ? "text-accent" : "text-muted"}`}>
              <Icon size={21} strokeWidth={group ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
