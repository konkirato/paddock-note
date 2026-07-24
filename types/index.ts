// 印(マーク)の値。◎○△×の4段階。
export type MarkValue = "◎" | "○" | "△" | "×";

// 観察の4つの観点。表示順もこの並びに従う。
export type ObservationAxis = "body" | "demeanor" | "movement" | "overall";

export const OBSERVATION_AXES: readonly ObservationAxis[] = [
  "body",
  "demeanor",
  "movement",
  "overall",
] as const;

export const AXIS_LABELS: Record<ObservationAxis, string> = {
  body: "馬体",
  demeanor: "気配",
  movement: "動き",
  overall: "総合",
};

// 進捗(n/m頭)や「入力済み」判定はこの観点のみで決まる。
export const REQUIRED_AXIS: ObservationAxis = "overall";

export interface Horse {
  id: string;
  raceId: string;
  number: number; // 馬番
  name: string; // 馬名
}

export interface Race {
  id: string;
  date: string; // ISO日付、例: "2026-07-24"
  track: string; // 競馬場
  raceNumber: number; // 第◯R
  name: string; // レース名
}

// 1頭・1観点・1レースぶんの観察記録。
// 印がついた = このレコードが存在する、という設計。
// クリアはレコードの削除であり、mark を null にするのではない。
export interface ObservationRecord {
  id: string; // `${raceId}:${horseId}:${axis}`
  raceId: string;
  horseId: string;
  axis: ObservationAxis;
  mark: MarkValue;
  createdAt: string; // ISO日時、初回作成時に設定
  updatedAt: string; // ISO日時、印を変更するたびに更新
}

// 結果入力画面で入力する着順。
export interface ResultRecord {
  id: string; // `${raceId}:${horseId}`
  raceId: string;
  horseId: string;
  finishPosition: number; // 着順(1始まり)
  updatedAt: string;
}
