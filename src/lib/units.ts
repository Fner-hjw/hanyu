import { LEVEL_SIZES } from "./levels";
import type { Word } from "./data";

export const UNIT_SIZE = 20;
export const unitCount = (level: number) => Math.ceil(LEVEL_SIZES[level] / UNIT_SIZE);
export function unitWords(words: Word[], unit: number): Word[] {
  return words.slice((unit - 1) * UNIT_SIZE, unit * UNIT_SIZE);
}
export function allUnits(): { level: number; unit: number }[] {
  return [1, 2, 3, 4, 5, 6, 7].flatMap((level) => Array.from({ length: unitCount(level) }, (_, i) => ({ level, unit: i + 1 })));
}
