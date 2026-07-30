// 観察の4項目の表示設定。列ヘッダー・セル描画・進捗判定(required)で使い回す。
export interface ObservationField {
  key: "overall" | "body" | "demeanor" | "movement";
  label: string;
  required: boolean;
  size: "lg" | "md";
}

export const OBSERVATION_FIELDS: ObservationField[] = [
  { key: "overall", label: "総合", required: true, size: "lg" },
  { key: "body", label: "馬体", required: false, size: "md" },
  { key: "demeanor", label: "気配", required: false, size: "md" },
  { key: "movement", label: "動き", required: false, size: "md" },
];
