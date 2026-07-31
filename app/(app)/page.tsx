"use client";

import Link from "next/link";

import { RaceCard } from "@/components/RaceCard";
import { SummaryCard } from "@/components/SummaryCard";
import { sortRacesDesc } from "@/lib/raceOptions";
import { useStore } from "@/lib/store";

const HOME_RACE_LIMIT = 5;

export default function HomePage() {
  const { races, getRaceSummary, getOverallStats } = useStore();
  const stats = getOverallStats();
  const latestRaces = sortRacesDesc(races).slice(0, HOME_RACE_LIMIT);

  return (
    <main className="mx-auto max-w-[380px] p-3">
      <div className="mb-4 flex items-baseline gap-1.5 px-1.5">
        <p className="text-[22px] font-bold tracking-wide text-foreground">ソウマガン</p>
        <p className="text-[11px] text-muted">パドック観察ノート</p>
      </div>

      <SummaryCard stats={stats} />

      <div className="mb-2 mt-4 flex items-center justify-between px-1.5">
        <p className="text-[13px] font-semibold text-muted">最近のレース</p>
        {races.length > HOME_RACE_LIMIT && (
          <Link href="/races" className="text-xs text-muted underline">
            すべて見る
          </Link>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {latestRaces.map((race) => (
          <RaceCard key={race.id} race={race} summary={getRaceSummary(race.id)} />
        ))}
      </div>

      <Link
        href="/races/new"
        className="sticky bottom-3 mt-4 flex h-[52px] w-full items-center justify-center rounded-[13px] bg-accent text-base font-semibold text-accent-foreground shadow-lg"
      >
        ＋ 新規レース
      </Link>
    </main>
  );
}
