import { NAV } from "@/lib/nav";
import { allUnits } from "@/lib/units";
import { ALL_DIALOGUES } from "@/data/dialogues-all";
import { HSK_LEVELS } from "@/lib/levels";

/** Everything "Download for offline" can fetch. Prerendered at build time (no runtime data). */
export async function GET() {
  const units: Record<number, string[]> = {};
  for (const { level, unit } of allUnits()) (units[level] ??= []).push(`/learn/${level}/${unit}`);
  return Response.json({
    pages: [...new Set([...NAV.filter((n) => n.ready).map((n) => n.href), "/account", "/more", "/practice", "/offline"])],
    dialogues: ALL_DIALOGUES.map((d) => `/dialogues/${d.id}`),
    units,
    data: [
      ...HSK_LEVELS.map((l) => `/data/words-${l}.json`),
      ...[1, 2, 3, 4, 5, 6].map((l) => `/data/sentences-${l}.json`),
      "/data/chars.json",
    ],
    dict: Array.from({ length: 64 }, (_, i) => `/dict/${i}.json`),
  });
}
