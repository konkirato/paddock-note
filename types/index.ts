// 印(マーク)の値。◎○△×の4段階。
export type MarkValue = "◎" | "○" | "△" | "×";

export interface Race {
  id: string;
  track: string; // 競馬場
  date: string; // ISO日付、例: "2026-07-24"
  raceNo: number; // レース番号(1〜12)
  heads: number; // 頭数(5〜18)
}

// 1頭ぶんの観察。馬名は扱わず、馬番と枠番(帽子色)で馬を識別する。
export interface Observation {
  id: string; // `${raceId}:${horseNo}`
  raceId: string;
  horseNo: number; // 馬番
  waku: number; // 枠番(1〜8)。lib/waku.ts の getWakuNumber で算出。
  overall: MarkValue | null; // 総合
  body: MarkValue | null; // 馬体
  demeanor: MarkValue | null; // 気配
  movement: MarkValue | null; // 動き
  memo?: string; // ひとことメモ(任意)
}

// 着順は単勝・複勝の的中判定に使うため、1〜3着とそれ以外(着外)のみを区別する。
export type FinishPosition = "1着" | "2着" | "3着" | "着外";

// 単勝オッズ帯。的中率を帯ごとに集計する用途を想定。
export type OddsBand = "~2.0" | "~5.0" | "~10.0" | "~20.0" | "20.0~";

// 1頭ぶんの結果。オッズ帯は未入力のまま結果を確定できるため null を許容する
// (的中率の計算には使うが、オッズ関連の集計からは除外する)。
export interface Result {
  id: string; // `${raceId}:${horseNo}`
  raceId: string;
  horseNo: number;
  finish: FinishPosition;
  oddsBand: OddsBand | null;
}
