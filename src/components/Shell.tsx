"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, CloudOff, Ellipsis, Flame, UserRound, CalendarCheck, Layers, Route, LayoutGrid } from "lucide-react";
import { GROUPS, NAV, visibleNav, type NavItem } from "@/lib/nav";
import { useSync } from "./SyncProvider";
import { registerServiceWorker, useOnline } from "@/lib/offline";
import { streak, useAppState, useHydrated } from "@/lib/store";

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
  const { status, email } = useSync();
  /** Practice is collapsed by default; null = follow the current page */
  const [practiceOpen, setPracticeOpen] = useState<boolean | null>(null);
  const online = useOnline();
  useEffect(() => registerServiceWorker(), []);
  const items = visibleNav();
  const days = hydrated ? streak(s) : 0;
  const dot = { synced: "bg-good", syncing: "bg-gold", error: "bg-accent", idle: "bg-line", "signed-out": "bg-line", offline: "bg-line", off: "" }[status];

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
        <Link href="/" className="mb-4 flex items-center gap-3 px-2">
          <Seal />
          <div className="leading-tight">
            <div className="text-[1.05rem] font-bold tracking-tight">Hànyǔ</div>
            <div className="text-xs text-muted">Chinese for life &amp; work</div>
          </div>
        </Link>
        <div className="mb-5 flex items-center gap-2">
          <Link href="/account" aria-label="Account"
            className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors ${path.startsWith("/account") ? "border-accent bg-accent-soft" : "border-line bg-card hover:bg-accent-soft"}`}>
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-soft text-sky">
              <UserRound size={16} />
              {dot && <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${dot}`} />}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-semibold">{email ?? "Account"}</span>
              <span className="block truncate text-xs text-muted">{email ? (status === "error" ? "Sync error" : status === "offline" ? "Will sync when online" : "Synced across devices") : "Sign in to sync"}</span>
            </span>
          </Link>
          <span className="flex shrink-0 items-center gap-1 px-1 text-sm" title={`${days} day streak`}>
            <Flame size={18} className={days ? "text-gold" : "text-muted"} />
            <b>{days}</b>
          </span>
        </div>
        <nav className="flex-1 space-y-4">
          {GROUPS.map((g) => {
            const gi = items.filter((n) => n.group === g);
            if (!gi.length) return null;
            if (g === "Practice") {
              const open = practiceOpen ?? gi.some((n) => isActive(path, n.href));
              return (
                <div key={g}>
                  <button type="button" onClick={() => setPracticeOpen(!open)} aria-expanded={open}
                    className="eyebrow mb-1.5 flex w-full items-center justify-between rounded-lg px-3 py-0.5 hover:text-fg">
                    <span>{g} <span className="font-medium normal-case tracking-normal">· {gi.length}</span></span>
                    <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && <NavList items={gi} path={path} />}
                </div>
              );
            }
            return (
              <div key={g}>
                <div className="eyebrow mb-1.5 px-3">{g}</div>
                <NavList items={gi} path={path} />
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ---- main ---- */}
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/85 px-4 py-2.5 backdrop-blur lg:hidden">
          <Link href="/" className="flex items-center gap-2"><Seal size={30} /><span className="font-bold">Hànyǔ</span></Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1"><Flame size={16} className={days ? "text-gold" : "text-muted"} /><b>{days}</b></span>
            <Link href="/account" aria-label="Account" className="relative"><UserRound size={20} />{dot && <span className={`absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ${dot}`} />}</Link>
          </div>
        </header>
        {!online && (
          <div role="status" className="flex items-center justify-center gap-2 border-b border-line bg-gold-soft px-4 py-1.5 text-center text-xs font-medium text-fg/80">
            <CloudOff size={14} className="shrink-0" /> Offline. Your progress is saved on this device{email ? " and will sync when you're back online" : ""}.
          </div>
        )}
        <main className="mx-auto w-full max-w-5xl px-4 pb-28 pt-6 lg:px-8 lg:pb-12 lg:pt-8">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-24 text-xs text-muted lg:px-8 lg:pb-8">
          Data: HSK 3.1 syllabus · CC-CEDICT (CC BY-SA 4.0) · HSK sentences &amp; audio by no7z (CC BY-SA 4.0) · Wikimedia CCD.
        </footer>
      </div>

      {/* ---- mobile tab bar ---- */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden" aria-label="Main">
        {tabs.map(({ href, label, icon: Icon }) => {
          const group = label === "Practice" ? NAV.filter((n) => n.group === "Practice").some((n) => isActive(path, n.href)) : label === "More" ? NAV.filter((n) => n.group === "Tools" || n.group === "You").some((n) => isActive(path, n.href)) || path.startsWith("/account") : isActive(path, href);
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

function NavList({ items, path }: { items: NavItem[]; path: string }) {
  return (
    <ul className="space-y-0.5">
      {items.map(({ href, label, icon: Icon }) => (
        <li key={href}>
          <Link href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-1.5 text-[0.92rem] font-medium transition-colors ${isActive(path, href) ? "bg-accent text-accent-fg shadow-sm" : "text-fg/80 hover:bg-accent-soft"}`}>
            <Icon size={18} strokeWidth={2} />
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
