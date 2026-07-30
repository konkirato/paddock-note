"use client";

import { RaceCard } from "@/components/RaceCard";
import { SummaryCard } from "@/components/SummaryCard";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const { races, getRaceSummary, getOverallStats } = useStore();
  const stats = getOverallStats();

  return (
    <main className="mx-auto max-w-[380px] p-3">
      <div className="mb-4 flex items-baseline gap-1.5 px-1.5">
        <p className="text-[22px] font-bold tracking-wide text-foreground">ソウマガン</p>
        <p className="text-[11px] text-muted">パドック観察ノート</p>
      </div>

      <SummaryCard stats={stats} />

      <p className="mb-2 mt-4 px-1.5 text-[13px] font-semibold text-muted">レース</p>
      <div className="flex flex-col gap-2">
        {races.map((race) => (
          <RaceCard key={race.id} race={race} summary={getRaceSummary(race.id)} />
        ))}
      </div>

      <button
        type="button"
        className="sticky bottom-3 mt-4 h-[52px] w-full rounded-[13px] bg-accent text-base font-semibold text-accent-foreground shadow-lg"
      >
        ＋ 新規レース
      </button>
    </main>
  );
}
