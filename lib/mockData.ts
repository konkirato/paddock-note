import type { Horse, ObservationRecord, Race, ResultRecord } from "@/types";

const SEED_TIME = "2026-07-24T09:00:00.000Z";

export const INITIAL_RACES: Race[] = [
  {
    id: "race-1",
    date: "2026-07-24",
    track: "中山",
    raceNumber: 3,
    name: "3歳未勝利",
  },
  {
    id: "race-2",
    date: "2026-07-24",
    track: "中山",
    raceNumber: 8,
    name: "サマーステークス",
  },
  {
    id: "race-3",
    date: "2026-07-24",
    track: "中山",
    raceNumber: 11,
    name: "中山記念",
  },
];

export const INITIAL_HORSES: Horse[] = [
  // race-1: 7頭
  { id: "race-1-1", raceId: "race-1", number: 1, name: "ハルウララ" },
  { id: "race-1-2", raceId: "race-1", number: 2, name: "キタノオーロラ" },
  { id: "race-1-3", raceId: "race-1", number: 3, name: "サクラフブキ" },
  { id: "race-1-4", raceId: "race-1", number: 4, name: "タイセイダッシュ" },
  { id: "race-1-5", raceId: "race-1", number: 5, name: "メイショウカゼ" },
  { id: "race-1-6", raceId: "race-1", number: 6, name: "エイシンノボル" },
  { id: "race-1-7", raceId: "race-1", number: 7, name: "ゴールドトウカ" },

  // race-2: 8頭
  { id: "race-2-1", raceId: "race-2", number: 1, name: "ミッドナイトブルー" },
  { id: "race-2-2", raceId: "race-2", number: 2, name: "リュウノシズク" },
  { id: "race-2-3", raceId: "race-2", number: 3, name: "アオイカゼ" },
  { id: "race-2-4", raceId: "race-2", number: 4, name: "コスモファング" },
  { id: "race-2-5", raceId: "race-2", number: 5, name: "テイエムグロウ" },
  { id: "race-2-6", raceId: "race-2", number: 6, name: "フジノアラシ" },
  { id: "race-2-7", raceId: "race-2", number: 7, name: "ダイワメテオ" },
  { id: "race-2-8", raceId: "race-2", number: 8, name: "ヒノデシャイン" },

  // race-3: 6頭
  { id: "race-3-1", raceId: "race-3", number: 1, name: "クロユリ" },
  { id: "race-3-2", raceId: "race-3", number: 2, name: "スズカアズマ" },
  { id: "race-3-3", raceId: "race-3", number: 3, name: "ナリタトビラ" },
  { id: "race-3-4", raceId: "race-3", number: 4, name: "ホクトセイラン" },
  { id: "race-3-5", raceId: "race-3", number: 5, name: "マツリダオト" },
  { id: "race-3-6", raceId: "race-3", number: 6, name: "レイメイスパーク" },
];

function overallRecord(horseId: string, raceId: string, mark: ObservationRecord["mark"]): ObservationRecord {
  return {
    id: `${raceId}:${horseId}:overall`,
    raceId,
    horseId,
    axis: "overall",
    mark,
    createdAt: SEED_TIME,
    updatedAt: SEED_TIME,
  };
}

// race-1 は総合まで入力済みにしておき、ホーム画面の「入力済み」表示を
// 初期状態で確認できるようにする。他の2レースは未入力のまま。
export const INITIAL_OBSERVATIONS: ObservationRecord[] = [
  overallRecord("race-1-1", "race-1", "◎"),
  overallRecord("race-1-2", "race-1", "○"),
  overallRecord("race-1-3", "race-1", "△"),
  overallRecord("race-1-4", "race-1", "○"),
  overallRecord("race-1-5", "race-1", "×"),
  overallRecord("race-1-6", "race-1", "△"),
  overallRecord("race-1-7", "race-1", "○"),
];

export const INITIAL_RESULTS: ResultRecord[] = [];
