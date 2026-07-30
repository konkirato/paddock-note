"use client";

import { RaceCard } from "@/components/RaceCard";
import { usePaddockNote } from "@/lib/paddock-note-context";

export default function HomePage() {
  const { races, getHorsesForRace, getRaceProgress } = usePaddockNote();

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-bold">パドックノート</h1>
      <p className="mt-1 text-sm text-foreground/70">レースを選んで観察を記録する</p>

      <div className="mt-4 flex flex-col gap-3">
        {races.map((race) => (
          <RaceCard
            key={race.id}
            race={race}
            horseCount={getHorsesForRace(race.id).length}
            progress={getRaceProgress(race.id)}
          />
        ))}
      </div>
    </main>
  );
}
