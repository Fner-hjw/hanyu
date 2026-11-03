import Link from "next/link";
import { ChevronRight, UserRound } from "lucide-react";
import { NAV } from "@/lib/nav";
import { PageHeader } from "./ui";

export function Hub({ group, title, subtitle }: { group: "Practice" | "Tools"; title: string; subtitle: string }) {
  const items = NAV.filter((n) => n.group === group && n.ready);
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className="card group flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><Icon size={22} /></span>
            <span className="min-w-0 flex-1"><span className="block font-semibold">{label}</span><span className="block text-sm text-muted">{desc}</span></span>
            <ChevronRight size={18} className="text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
        {group === "Tools" && (
          <Link href="/account" className="card flex items-center gap-4 p-4 hover:-translate-y-0.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-soft text-sky"><UserRound size={22} /></span>
            <span className="flex-1"><span className="block font-semibold">Account &amp; sync</span><span className="block text-sm text-muted">Back up and sync across devices</span></span>
            <ChevronRight size={18} className="text-muted" />
          </Link>
        )}
      </div>
    </div>
  );
}
