"use client";

import { usePaddockNote } from "@/lib/paddock-note-context";
import { OBSERVATION_AXES } from "@/types";

export default function StatsPage() {
  const { races, getHorsesForRace, getObservationMark, getRaceProgress } = usePaddockNote();

  const recordedRaceCount = races.filter((race) => getRaceProgress(race.id).done > 0).length;

  const totalObservationCount = races.reduce((sum, race) => {
    const horses = getHorsesForRace(race.id);
    const raceCount = horses.reduce((horseSum, horse) => {
      const markedAxes = OBSERVATION_AXES.filter(
        (axis) => getObservationMark(race.id, horse.id, axis) !== undefined
      ).length;
      return horseSum + markedAxes;
    }, 0);
    return sum + raceCount;
  }, 0);

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-xl font-bold">統計</h1>
      <p className="mt-1 text-sm text-foreground/70">観察の記録状況(一部は今後実装予定)</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile label="記録したレース数" value={`${recordedRaceCount}`} />
        <StatTile label="記録した観察件数" value={`${totalObservationCount}`} />
        <StatTile label="的中率" value="近日対応" placeholder />
        <StatTile label="観点別の傾向" value="近日対応" placeholder />
      </div>
    </main>
  );
}

function StatTile({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: boolean;
}) {
  return (
    <div className="rounded-lg border-2 border-border p-3">
      <p className="text-xs text-foreground/70">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${placeholder ? "text-foreground/40" : ""}`}>
        {value}
      </p>
    </div>
  );
}
