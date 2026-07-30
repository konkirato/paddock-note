// 枠番(1〜8)に対応する帽子色のデザイントークン。
// 値は将来の配色変更に備えてこの一箇所にまとめる。
// bg/text はインラインスタイルでの塗りつぶし表示、border は枠線用。

export interface WakuColorTokens {
  waku: number;
  label: string; // 帽子色の名称
  bg: string;
  text: string;
  border: string;
}

export const WAKU_COLORS: Record<number, WakuColorTokens> = {
  1: { waku: 1, label: "白", bg: "#ffffff", text: "#171717", border: "#171717" },
  2: { waku: 2, label: "黒", bg: "#171717", text: "#ffffff", border: "#171717" },
  3: { waku: 3, label: "赤", bg: "#dc2626", text: "#ffffff", border: "#991b1b" },
  4: { waku: 4, label: "青", bg: "#2563eb", text: "#ffffff", border: "#1d4ed8" },
  5: { waku: 5, label: "黄", bg: "#facc15", text: "#171717", border: "#a16207" },
  6: { waku: 6, label: "緑", bg: "#16a34a", text: "#ffffff", border: "#166534" },
  7: { waku: 7, label: "橙", bg: "#f97316", text: "#ffffff", border: "#c2410c" },
  8: { waku: 8, label: "桃", bg: "#ec4899", text: "#ffffff", border: "#be185d" },
};
