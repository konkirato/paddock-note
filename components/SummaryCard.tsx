import type { OverallStats } from "@/lib/store";

interface SummaryCardProps {
  stats: OverallStats;
}

export function SummaryCard({ stats }: SummaryCardProps) {
  return (
    <div className="rounded-[14px] bg-accent px-4 py-4 text-accent-foreground">
      <p className="mb-3 text-xs text-accent-foreground/60">
        観察成績(総合◎・結果入力済み{stats.resultedRaceCount}レース)
      </p>
      <div className="flex gap-2">
        <Stat value={`${Math.round(stats.placeRate)}`} suffix="%" label="複勝率" />
        <Stat value={`${Math.round(stats.winRate)}`} suffix="%" label="単勝率" />
        <Stat value={`${stats.observedHorseCount}`} label="観察数" />
      </div>
    </div>
  );
}

function Stat({ value, suffix, label }: { value: string; suffix?: string; label: string }) {
  return (
    <div className="flex-1 text-center">
      <div className="text-[26px] font-bold tabular-nums">
        {value}
        {suffix ? <small className="text-[13px] font-normal">{suffix}</small> : null}
      </div>
      <div className="mt-0.5 text-[11px] text-accent-foreground/60">{label}</div>
    </div>
  );
}
