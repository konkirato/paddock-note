"use client";

import { RaceCard } from "@/components/RaceCard";
import { sortRacesDesc } from "@/lib/raceOptions";
import { useStore } from "@/lib/store";

export function RaceListScreen() {
  const { races, getRaceSummary } = useStore();
  const sortedRaces = sortRacesDesc(races);

  return (
    <main className="mx-auto max-w-[380px] p-3">
      <header className="mb-3 px-1.5">
        <p className="text-lg font-bold text-foreground">レース一覧</p>
      </header>

      {sortedRaces.length === 0 ? (
        <p className="rounded-[14px] border border-border bg-card px-3 py-6 text-center text-sm text-muted">
          まだレースがありません。
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedRaces.map((race) => (
            <RaceCard key={race.id} race={race} summary={getRaceSummary(race.id)} />
          ))}
        </div>
      )}
    </main>
  );
}
