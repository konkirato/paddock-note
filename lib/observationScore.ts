import type { MarkValue } from "@/types";

const MARK_POINTS: Record<MarkValue, number> = {
  "◎": 4,
  "○": 3,
  "△": 2,
  "×": 1,
};

export interface HorseSubMarks {
  horseNo: number;
  body: MarkValue | null;
  demeanor: MarkValue | null;
  movement: MarkValue | null;
}

function subScore(horse: HorseSubMarks): number {
  return (
    (horse.body ? MARK_POINTS[horse.body] : 0) +
    (horse.demeanor ? MARK_POINTS[horse.demeanor] : 0) +
    (horse.movement ? MARK_POINTS[horse.movement] : 0)
  );
}

function isTouched(horse: HorseSubMarks): boolean {
  return horse.body !== null || horse.demeanor !== null || horse.movement !== null;
}

// 馬体・気配・動きの合計点(◎4点〜×1点、未入力は0点)でレース内の順位をつけ、
// 1位=◎、残りを○△×の3グループにできるだけ均等(端数は上位グループ優先)に振り分ける。
// 3項目とも未入力の馬は集計対象外とし、総合はnull(未評価)のままにする。
export function computeOverallMarks(horses: HorseSubMarks[]): Record<number, MarkValue | null> {
  const result: Record<number, MarkValue | null> = {};
  for (const horse of horses) {
    result[horse.horseNo] = null;
  }

  const touched = horses
    .filter(isTouched)
    .sort((a, b) => subScore(b) - subScore(a) || a.horseNo - b.horseNo);

  if (touched.length === 0) return result;

  const [top, ...rest] = touched;
  result[top.horseNo] = "◎";

  const base = Math.floor(rest.length / 3);
  const remainder = rest.length % 3;
  const groupSizes = [
    base + (remainder > 0 ? 1 : 0),
    base + (remainder > 1 ? 1 : 0),
    base,
  ];
  const groupMarks: MarkValue[] = ["○", "△", "×"];

  let index = 0;
  groupSizes.forEach((size, groupIndex) => {
    for (let i = 0; i < size; i++) {
      result[rest[index].horseNo] = groupMarks[groupIndex];
      index++;
    }
  });

  return result;
}
