import { WAKU_COLORS, type WakuColorTokens } from "@/lib/theme";

// JRAの枠番割り振りルール:
// - 8頭以下 … 馬番=枠番の1頭1枠
// - 9〜16頭 … 8枠から内側に向かって1枠ずつ2頭になっていく
//   (例: 9頭なら8枠のみ2頭、16頭なら全枠2頭)
// - 17〜18頭 … すでに2頭になっている外枠(8枠→7枠の順)がさらに3頭になる
//   (例: 17頭なら8枠のみ3頭、18頭なら8枠・7枠が3頭)
function getWakuCapacities(heads: number): number[] {
  if (heads <= 8) {
    return Array.from({ length: 8 }, (_, i) => (i < heads ? 1 : 0));
  }
  if (heads <= 16) {
    const doubledFrames = heads - 8;
    return Array.from({ length: 8 }, (_, i) => (i + 1 > 8 - doubledFrames ? 2 : 1));
  }
  const tripledFrames = heads - 16;
  return Array.from({ length: 8 }, (_, i) => (i + 1 > 8 - tripledFrames ? 3 : 2));
}

// 頭数(5〜18)と馬番から、その馬の枠番(1〜8)を返す。
export function getWakuNumber(horseNo: number, heads: number): number {
  const capacities = getWakuCapacities(heads);
  let remaining = horseNo;
  for (let waku = 1; waku <= 8; waku++) {
    const capacity = capacities[waku - 1];
    if (remaining <= capacity) {
      return waku;
    }
    remaining -= capacity;
  }
  throw new RangeError(`horseNo ${horseNo} is out of range for heads ${heads}`);
}

// 枠番(1〜8)から帽子色のデザイントークンを返す。
export function getWakuColor(waku: number): WakuColorTokens {
  const color = WAKU_COLORS[waku];
  if (!color) {
    throw new RangeError(`waku ${waku} is out of range (1-8)`);
  }
  return color;
}
