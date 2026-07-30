import Link from "next/link";

import type { RaceSummary } from "@/lib/store";
import { getWakuColor } from "@/lib/waku";
import type { Race } from "@/types";

interface RaceCardProps {
  race: Race;
  summary: RaceSummary;
}

const STATUS_BADGE: Record<RaceSummary["status"], { label: string; className: string } | null> = {
  none: { label: "未観察", className: "bg-[#f0f0f2] text-muted" },
  wait: { label: "結果待ち", className: "bg-[#fff3cd] text-[#8a6d00]" },
  hit: { label: "的中", className: "bg-[#d7f0dd] text-[#1a7a33]" },
  miss: { label: "不的中", className: "bg-[#f0f0f2] text-muted" },
};

export function RaceCard({ race, summary }: RaceCardProps) {
  const wakuColor = summary.waku != null ? getWakuColor(summary.waku) : null;
  const badge = STATUS_BADGE[summary.status];

  return (
    <Link
      href={`/races/${race.id}/observe`}
      className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3 active:bg-background"
    >
      <div
        className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-md text-sm font-bold"
        style={
          wakuColor
            ? {
                backgroundColor: wakuColor.bg,
                color: wakuColor.text,
                border: `1px solid ${wakuColor.border}`,
              }
            : { backgroundColor: "var(--background)", color: "var(--muted)", border: "1px solid var(--border)" }
        }
      >
        {summary.primaryHorseNo ?? "-"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-foreground">
          {race.track} {race.raceNo}R
          <span className="ml-1.5 text-xs font-normal text-muted">{race.date}</span>
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs">
          {badge ? (
            <span className={`rounded-full px-2 py-0.5 font-semibold ${badge.className}`}>
              {badge.label}
            </span>
          ) : null}
          {summary.hitLabel ? (
            <span className="font-semibold text-[#1a7a33]">{summary.hitLabel}</span>
          ) : null}
        </div>
      </div>
      <span className="shrink-0 text-lg text-border">›</span>
    </Link>
  );
}
