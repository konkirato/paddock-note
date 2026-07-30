"use client";

import { Donut } from "@/components/Donut";
import { useStore } from "@/lib/store";

const FINISH_COLORS = {
  first: "#1c1c1e",
  second: "#5a5a5f",
  third: "#9a9aa0",
  outOfPlace: "#d1d1d6",
};

export default function StatsPage() {
  const { getOverallStats, getFinishBreakdown, getOddsBandBreakdown } = useStore();
  const stats = getOverallStats();
  const finish = getFinishBreakdown();
  const oddsBands = getOddsBandBreakdown();

  const segments = [
    { label: "1着", value: finish.first, color: FINISH_COLORS.first },
    { label: "2着", value: finish.second, color: FINISH_COLORS.second },
    { label: "3着", value: finish.third, color: FINISH_COLORS.third },
    { label: "着外", value: finish.outOfPlace, color: FINISH_COLORS.outOfPlace },
  ];

  return (
    <main className="mx-auto max-w-[380px] p-3 pb-6">
      <h1 className="mb-4 px-1.5 text-xl font-bold text-foreground">観察成績</h1>

      <div className="mb-3.5 rounded-[14px] border border-border bg-card p-4">
        <p className="mb-2 text-xs text-muted">
          総合◎の成績(結果入力済み{stats.resultedRaceCount}レース)
        </p>
        <div className="py-1 text-center">
          <div className="text-[52px] font-bold leading-none tabular-nums text-foreground">
            {Math.round(stats.placeRate)}
            <small className="text-[22px] font-semibold">%</small>
          </div>
          <p className="mt-1.5 text-[13px] text-muted">複勝率(3着以内)</p>
          <div className="mt-4 flex justify-center gap-6 border-t border-border pt-4">
            <SubStat value={`${Math.round(stats.winRate)}%`} label="単勝率" />
            <SubStat
              value={
                stats.estimatedReturnRate == null
                  ? "-"
                  : `${Math.round(stats.estimatedReturnRate)}%`
              }
              label="単勝回収率(概算)"
            />
          </div>
        </div>
      </div>

      <div className="mb-3.5 rounded-[14px] border border-border bg-card p-4">
        <p className="mb-3 text-xs text-muted">◎の着順内訳</p>
        {finish.total === 0 ? (
          <p className="text-sm text-muted">まだ結果が入力されたレースがありません。</p>
        ) : (
          <div className="flex items-center gap-4">
            <Donut
              segments={segments}
              centerValue={`${Math.round(stats.placeRate)}%`}
              centerLabel="複勝内"
            />
            <div className="flex-1">
              {segments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-2 py-1 text-[13px]">
                  <span
                    className="h-3 w-3 shrink-0 rounded-[3px]"
                    style={{
                      backgroundColor: seg.color,
                      border: seg.color === "#d1d1d6" ? "1px solid var(--border)" : undefined,
                    }}
                  />
                  <span className="flex-1 text-foreground">{seg.label}</span>
                  <span className="font-semibold tabular-nums text-foreground/70">
                    {Math.round((seg.value / finish.total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[14px] border border-border bg-card p-4">
        <p className="mb-2.5 text-xs text-muted">オッズ帯別の複勝率(◎)</p>
        {oddsBands.every((b) => b.count === 0) ? (
          <p className="text-sm text-muted">まだ結果が入力されたレースがありません。</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {oddsBands.map((b) => (
              <div key={b.band} className="flex items-center gap-2.5">
                <span className="w-14 shrink-0 text-xs tabular-nums text-foreground/70">
                  {b.band}
                </span>
                <div className="h-[22px] flex-1 overflow-hidden rounded-md bg-background">
                  <div
                    className="flex h-full items-center justify-end rounded-md bg-accent px-1.5"
                    style={{ width: `${Math.max(b.placeRate, b.count > 0 ? 8 : 0)}%` }}
                  >
                    {b.count > 0 ? (
                      <span className="text-[11px] font-semibold text-accent-foreground">
                        {Math.round(b.placeRate)}%
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="w-8 shrink-0 text-right text-xs text-muted">{b.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function SubStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-[22px] font-bold tabular-nums text-foreground">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted">{label}</div>
    </div>
  );
}
