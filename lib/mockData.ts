import { getWakuNumber } from "@/lib/waku";
import type { FinishPosition, MarkValue, Observation, OddsBand, Race, Result } from "@/types";

const MARK_CYCLE: MarkValue[] = ["◎", "○", "△", "×"];
const ODDS_CYCLE: OddsBand[] = ["~2.0", "~5.0", "~10.0", "~20.0", "20.0~"];

function markAt(offset: number): MarkValue {
  return MARK_CYCLE[offset % MARK_CYCLE.length];
}

function buildObservations(
  raceId: string,
  heads: number,
  memoByHorseNo: Record<number, string> = {}
): Observation[] {
  return Array.from({ length: heads }, (_, index) => {
    const horseNo = index + 1;
    return {
      id: `${raceId}:${horseNo}`,
      raceId,
      horseNo,
      waku: getWakuNumber(horseNo, heads),
      overall: markAt(horseNo),
      body: markAt(horseNo + 1),
      demeanor: markAt(horseNo + 2),
      movement: markAt(horseNo + 3),
      memo: memoByHorseNo[horseNo],
    };
  });
}

function buildResults(
  raceId: string,
  heads: number,
  podium: { first: number; second: number; third: number },
  oddsByHorseNo: Partial<Record<number, OddsBand>> = {}
): Result[] {
  return Array.from({ length: heads }, (_, index) => {
    const horseNo = index + 1;
    let finish: FinishPosition = "着外";
    if (horseNo === podium.first) finish = "1着";
    else if (horseNo === podium.second) finish = "2着";
    else if (horseNo === podium.third) finish = "3着";
    return {
      id: `${raceId}:${horseNo}`,
      raceId,
      horseNo,
      finish,
      oddsBand: oddsByHorseNo[horseNo] ?? ODDS_CYCLE[index % ODDS_CYCLE.length],
    };
  });
}

export const INITIAL_RACES: Race[] = [
  { id: "race-1", track: "中山", date: "2026-07-24", raceNo: 3, heads: 8 },
  { id: "race-2", track: "中山", date: "2026-07-24", raceNo: 8, heads: 12 },
  { id: "race-3", track: "中山", date: "2026-07-24", raceNo: 11, heads: 18 },
];

export const INITIAL_OBSERVATIONS: Observation[] = [
  ...buildObservations("race-1", 8, {
    3: "パドックで一番テンションが高かった",
    6: "後肢の踏み込みが浅い",
  }),
  ...buildObservations("race-2", 12, {
    9: "気配が良く落ち着いていた",
  }),
  ...buildObservations("race-3", 18, {
    5: "毛づやが良く仕上がって見えた",
    1: "やや発汗が多い",
  }),
];

export const INITIAL_RESULTS: Result[] = [
  ...buildResults(
    "race-1",
    8,
    { first: 3, second: 1, third: 6 },
    { 3: "~2.0", 1: "~5.0", 6: "~10.0" }
  ),
  ...buildResults(
    "race-2",
    12,
    { first: 9, second: 2, third: 11 },
    { 9: "~10.0", 2: "~2.0", 11: "20.0~" }
  ),
  ...buildResults(
    "race-3",
    18,
    { first: 5, second: 14, third: 1 },
    { 5: "~5.0", 14: "~20.0", 1: "~2.0" }
  ),
];
