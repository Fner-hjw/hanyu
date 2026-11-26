import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-[1.65rem] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-pretty text-[0.95rem] text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Progress({ value, tone = "accent", className = "" }: { value: number; tone?: "accent" | "good" | "gold" | "sky"; className?: string }) {
  const c = { accent: "bg-accent", good: "bg-good", gold: "bg-gold", sky: "bg-sky" }[tone];
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-line ${className}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full transition-all duration-500 ${c}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Ring({ value, size = 96, stroke = 9, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} style={{ transition: "stroke-dashoffset .6s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "accent" | "good" | "gold" | "sky" }) {
  const c = {
    muted: "bg-card2 text-muted border-line",
    accent: "bg-accent-soft text-accent border-transparent",
    good: "bg-good-soft text-good border-transparent",
    gold: "bg-gold-soft text-gold border-transparent",
    sky: "bg-sky-soft text-sky border-transparent",
  }[tone];
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold ${c}`}>{children}</span>;
}

/** "1 point", "2 points"; pass `many` for irregular plurals. */
export function plural(n: number, one: string, many = `${one}s`) {
  return `${n.toLocaleString()} ${n === 1 ? one : many}`;
}

export function Stat({ label, value, sub, icon }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between text-muted">
        <span className="eyebrow">{label}</span>
        {icon}
      </div>
      <div className="mt-1 text-3xl font-bold tracking-tight">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card-flat p-8 text-center">
      <div className="hanzi mb-2 text-4xl text-accent">空</div>
      <p className="font-semibold">{title}</p>
      {children && <div className="mt-1 text-sm text-muted">{children}</div>}
    </div>
  );
}
