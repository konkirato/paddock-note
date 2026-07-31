import type { Race } from "@/types";

export const TRACKS = ["札幌", "函館", "福島", "新潟", "東京", "中山", "中京", "京都", "阪神", "小倉"];
export const RACE_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);
export const HEADS_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 5); // 5〜18

// 開催日が新しい順(同日はレース番号が大きい順)に並べ替える。
export function sortRacesDesc(races: Race[]): Race[] {
  return [...races].sort((a, b) =>
    b.date === a.date ? b.raceNo - a.raceNo : b.date.localeCompare(a.date)
  );
}
