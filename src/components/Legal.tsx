import type { ReactNode } from "react";
import Link from "next/link";

/** Shared contact + date for the privacy policy and terms. Set NEXT_PUBLIC_CONTACT_EMAIL in Vercel. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
export const LEGAL_UPDATED = "3 November 2026";
export const APP_NAME = "Hanyu Easy";

export function Contact() {
  return CONTACT_EMAIL
    ? <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-accent">{CONTACT_EMAIL}</a>
    : <a href="https://github.com/Fner-hjw/hanyu/issues" className="font-semibold text-accent">github.com/Fner-hjw/hanyu/issues</a>;
}

export function LegalPage({ title, children, other }: { title: string; children: ReactNode; other: { href: string; label: string } }) {
  return (
    <article className="space-y-6 text-[0.95rem] leading-relaxed">
      <header>
        <h1 className="text-[1.65rem] font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">Last updated: {LEGAL_UPDATED}</p>
      </header>
      {children}
      <p className="border-t border-line pt-4 text-sm text-muted">
        See also our <Link href={other.href} className="font-semibold text-accent">{other.label}</Link>.
      </p>
    </article>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function List({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;
}
