import Link from "next/link";

import type { Race } from "@/types";

interface RaceCardProps {
  race: Race;
  horseCount: number;
  progress: { done: number; total: number };
}

export function RaceCard({ race, horseCount, progress }: RaceCardProps) {
  const isFilled = progress.total > 0 && progress.done === progress.total;

  return (
    <Link
      href={`/races/${race.id}/observe`}
      className="block min-h-11 rounded-lg border-2 border-border p-4 active:bg-foreground/5"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-foreground/70">
            {race.date} {race.track} {race.raceNumber}R
          </p>
          <p className="mt-1 text-lg font-bold">{race.name}</p>
        </div>
        {isFilled ? (
          <span className="shrink-0 rounded-full bg-foreground px-3 py-1 text-xs font-bold text-background">
            入力済み
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        {horseCount}頭立て・観察 {progress.done}/{progress.total}頭
      </p>
    </Link>
  );
}
