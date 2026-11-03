"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      </nav>
    </header>
  );
}
