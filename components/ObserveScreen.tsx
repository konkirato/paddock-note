"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { ObservationTable } from "@/components/ObservationTable";
import { useClickOutside } from "@/hooks/useClickOutside";
import { usePaddockNote } from "@/lib/paddock-note-context";
import type { MarkValue, ObservationAxis } from "@/types";

interface OpenCell {
  horseId: string;
  axis: ObservationAxis;
}

interface ObserveScreenProps {
  raceId: string;
}

export function ObserveScreen({ raceId }: ObserveScreenProps) {
  const router = useRouter();
  const {
    getRace,
    getHorsesForRace,
    getObservationMark,
    setObservationMark,
    clearObservationMark,
    getRaceProgress,
  } = usePaddockNote();

  const [openCell, setOpenCell] = useState<OpenCell | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useClickOutside(tableContainerRef, () => setOpenCell(null), openCell !== null);

  const race = getRace(raceId);
  const horses = useMemo(() => getHorsesForRace(raceId), [getHorsesForRace, raceId]);
  const progress = getRaceProgress(raceId);

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

  function handleOpenCell(horseId: string, axis: ObservationAxis) {
    setOpenCell((prev) =>
      prev && prev.horseId === horseId && prev.axis === axis ? null : { horseId, axis }
    );
  }

  function handleClearCell(horseId: string, axis: ObservationAxis) {
    clearObservationMark(raceId, horseId, axis);
  }

  function handleSelectMark(horseId: string, axis: ObservationAxis, mark: MarkValue) {
    setObservationMark(raceId, horseId, axis, mark);
    setOpenCell(null);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col pb-24">
      <header className="sticky top-0 z-10 border-b-2 border-foreground bg-background p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href="/" className="text-xs text-foreground/70 underline">
              ← レース一覧
            </Link>
            <h1 className="text-base font-bold">
              {race.track} {race.raceNumber}R {race.name}
            </h1>
          </div>
          <p className="shrink-0 text-lg font-bold">
            {progress.done}/{progress.total}頭
          </p>
        </div>
        <Link
          href={`/races/${raceId}/result`}
          className="mt-1 inline-block text-xs text-foreground/70 underline"
        >
          結果を入力する
        </Link>
      </header>

      <div ref={tableContainerRef} className="flex-1 overflow-x-auto">
        <ObservationTable
          horses={horses}
          openCell={openCell}
          getMark={(horseId, axis) => getObservationMark(raceId, horseId, axis)}
          onOpenCell={handleOpenCell}
          onClearCell={handleClearCell}
          onSelectMark={handleSelectMark}
        />
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
