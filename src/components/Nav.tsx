"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSync } from "./SyncProvider";

const LINKS = [
  ["/", "Home"],
  ["/flashcards", "Flashcards"],
  ["/vocab", "Vocabulary"],
  ["/dialogues", "Dialogues"],
  ["/grammar", "Grammar"],
  ["/reader", "Reader"],
  ["/test", "Test"],
] as const;

export function Nav() {
  const path = usePathname();
  const { status } = useSync();
  const dot = { synced: "bg-good", syncing: "bg-yellow-500", error: "bg-accent", idle: "bg-line", "signed-out": "bg-line", off: "" }[status];
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center gap-1 overflow-x-auto px-4 py-3">
        <Link href="/" className="han mr-3 shrink-0 text-xl font-bold text-accent">
          汉语
        </Link>
        {LINKS.map(([href, label]) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${active ? "bg-accent text-white" : "text-muted hover:bg-accent-soft"}`}
            >
              {label}
            </Link>
          );
        })}
        {status !== "off" && (
          <Link href="/account" className={`ml-auto flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm ${path.startsWith("/account") ? "bg-accent text-white" : "text-muted hover:bg-accent-soft"}`}>
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            Account
          </Link>
        )}
      </nav>
    </header>
  );
}
