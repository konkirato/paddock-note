"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { usePaddockNote } from "@/lib/paddock-note-context";

interface ResultScreenProps {
  raceId: string;
}

export function ResultScreen({ raceId }: ResultScreenProps) {
  const router = useRouter();
  const { getRace, getHorsesForRace, getResult, setResult } = usePaddockNote();

  const race = getRace(raceId);
  const horses = getHorsesForRace(raceId);

  if (!race) {
    return (
      <main className="mx-auto max-w-md p-4">
        <p>レースが見つかりません。</p>
        <Link href="/" className="mt-4 inline-block underline">
          レース一覧に戻る
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col pb-24">
      <header className="sticky top-0 z-10 border-b-2 border-foreground bg-background p-3">
        <Link href={`/races/${raceId}/observe`} className="text-xs text-foreground/70 underline">
          ← 観察入力に戻る
        </Link>
        <h1 className="text-base font-bold">
          {race.track} {race.raceNumber}R {race.name} 結果入力
        </h1>
      </header>

      <div className="flex-1 p-3">
        <ul className="flex flex-col gap-2">
          {horses.map((horse) => (
            <li
              key={horse.id}
              className="flex items-center justify-between gap-3 rounded-md border-2 border-border p-3"
            >
              <span className="font-bold">
                {horse.number} {horse.name}
              </span>
              <label className="flex items-center gap-2 text-sm">
                着順
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={horses.length}
                  value={getResult(raceId, horse.id) ?? ""}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (event.target.value !== "" && !Number.isNaN(value)) {
                      setResult(raceId, horse.id, value);
                    }
                  }}
                  className="min-h-11 w-16 rounded-md border-2 border-foreground p-2 text-center text-lg"
                />
                着
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t-2 border-foreground bg-background p-3">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="min-h-11 w-full rounded-md bg-foreground text-lg font-bold text-background"
          >
            保存する
          </button>
        </div>
      </div>
    </main>
  );
}
