"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import type { MarksByField } from "@/components/HorseRow";
import { ObservationList, type HorseListItem } from "@/components/ObservationList";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { ObservationField } from "@/lib/observationFields";
import { useStore } from "@/lib/store";
import { getWakuColor, getWakuNumber } from "@/lib/waku";
import type { MarkValue } from "@/types";

interface ObserveScreenProps {
  raceId: string;
}

interface OpenCell {
  horseNo: number;
  field: ObservationField["key"];
}

export function ObserveScreen({ raceId }: ObserveScreenProps) {
  const { getRace, getMark, setMark, clearMark, getRaceProgress } = useStore();
  const race = getRace(raceId);

  const horses: HorseListItem[] = useMemo(() => {
    if (!race) return [];
    return Array.from({ length: race.heads }, (_, i) => {
      const horseNo = i + 1;
      const waku = getWakuNumber(horseNo, race.heads);
      return { horseNo, wakuColor: getWakuColor(waku) };
    });
  }, [race]);

  const marksByHorseNo = useMemo(() => {
    const map: Record<number, MarksByField> = {};
    for (const horse of horses) {
      map[horse.horseNo] = {
        overall: getMark(raceId, horse.horseNo, "overall"),
        body: getMark(raceId, horse.horseNo, "body"),
        demeanor: getMark(raceId, horse.horseNo, "demeanor"),
        movement: getMark(raceId, horse.horseNo, "movement"),
      };
    }
    return map;
  }, [horses, getMark, raceId]);

  const [openCell, setOpenCell] = useState<OpenCell | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useClickOutside(listRef, () => setOpenCell(null), openCell !== null);

  if (!race) {
    return (
      <main className="mx-auto max-w-[380px] p-3">
        <p className="text-sm text-foreground">レースが見つかりません。</p>
        <Link href="/" className="mt-2 inline-block text-sm text-muted underline">
          レース一覧に戻る
        </Link>
      </main>
    );
  }

  const progress = getRaceProgress(raceId);

  function handleOpenField(horseNo: number, field: ObservationField["key"]) {
    setOpenCell((prev) =>
      prev && prev.horseNo === horseNo && prev.field === field ? null : { horseNo, field }
    );
  }

  function handleClearField(horseNo: number, field: ObservationField["key"]) {
    clearMark(raceId, horseNo, field);
  }

  function handleSelectMark(horseNo: number, field: ObservationField["key"], mark: MarkValue) {
    setMark(raceId, horseNo, field, mark);
    setOpenCell(null);
  }

  return (
    <main className="mx-auto max-w-[380px] p-3">
      <header className="sticky top-0 z-10 mb-3 flex items-start justify-between gap-2 rounded-[14px] border border-border bg-card px-3 py-3">
        <div>
          <Link href="/" className="text-xs text-muted underline">
            ← レース一覧
          </Link>
          <p className="mt-0.5 text-xs text-muted">
            {race.track} ・ {race.date}
          </p>
          <p className="text-base font-bold text-foreground">{race.raceNo}R</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold text-foreground">
            {progress.done}/{race.heads}頭
          </p>
          <Link
            href={`/races/${raceId}/result`}
            className="mt-1 inline-flex h-11 items-center justify-center rounded-full bg-accent px-4 text-xs font-semibold text-accent-foreground"
          >
            結果を入力
          </Link>
        </div>
      </header>

      <div ref={listRef}>
        <ObservationList
          horses={horses}
          marksByHorseNo={marksByHorseNo}
          openCell={openCell}
          onOpenField={handleOpenField}
          onClearField={handleClearField}
          onSelectMark={handleSelectMark}
        />
      </div>
    </main>
  );
}
