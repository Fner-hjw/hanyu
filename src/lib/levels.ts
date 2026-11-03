/* Pure level constants – safe to import from server and client components. */
export const HSK_LEVELS = [1, 2, 3, 4, 5, 6, 7] as const;
export const levelLabel = (l: number) => (l === 7 ? "HSK 7–9" : `HSK ${l}`);
export const LEVEL_SIZES: Record<number, number> = { 1: 300, 2: 198, 3: 497, 4: 997, 5: 1591, 6: 1792, 7: 5583 };

/** syllabus sequence number → level (ids look like "h936") */
export function levelOfId(id: string): number {
  if (!id.startsWith("h")) return 0;
  const n = parseInt(id.slice(1), 10);
  return n <= 300 ? 1 : n <= 500 ? 2 : n <= 1000 ? 3 : n <= 2000 ? 4 : n <= 3600 ? 5 : n <= 5400 ? 6 : 7;
}
