// 観察の4項目の表示設定。列ヘッダー・セル描画で使い回す。
// 総合(overall)は馬体・気配・動きから自動算出するため readOnly。
export interface ObservationField {
  key: "overall" | "body" | "demeanor" | "movement";
  label: string;
  readOnly: boolean;
  size: "lg" | "md";
}

export const OBSERVATION_FIELDS: ObservationField[] = [
  { key: "overall", label: "総合", readOnly: true, size: "lg" },
  { key: "body", label: "馬体", readOnly: false, size: "md" },
  { key: "demeanor", label: "気配", readOnly: false, size: "md" },
  { key: "movement", label: "動き", readOnly: false, size: "md" },
];
