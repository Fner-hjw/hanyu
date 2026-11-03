import type { Compared } from "@/lib/compare";

/** Shows the target sentence with each character coloured by how well it was produced. */
export function Marked({ result, size = "text-2xl" }: { result: Compared; size?: string }) {
  return (
    <span className={`han ${size} leading-relaxed`} aria-label={`Score ${result.score} percent`}>
      {result.chars.map((c, i) => (
        <span key={i} title={c.mark === "near" ? "Right sound, different character" : c.mark === "miss" ? "Missed" : undefined}
          className={c.mark === "ok" ? "text-good" : c.mark === "near" ? "text-gold underline decoration-dotted" : "text-accent line-through decoration-1"}>
          {c.ch}
        </span>
      ))}
    </span>
  );
}

export function ScorePill({ score }: { score: number }) {
  const tone = score >= 85 ? "bg-good-soft text-good" : score >= 60 ? "bg-gold-soft text-gold" : "bg-accent-soft text-accent";
  const label = score >= 85 ? "Excellent" : score >= 60 ? "Good — keep going" : "Try again";
  return <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${tone}`}>{score}% · {label}</span>;
}
