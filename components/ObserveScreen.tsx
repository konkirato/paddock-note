"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import type { MarksByField } from "@/components/HorseRow";
import { ObservationList, type HorseListItem } from "@/components/ObservationList";
import { useClickOutside } from "@/hooks/useClickOutside";
import { computeOverallMarks } from "@/lib/observationScore";
import type { ObservationField } from "@/lib/observationFields";
import { useStore } from "@/lib/store";
import { getWakuColor, getWakuNumber } from "@/lib/waku";
import type { MarkValue } from "@/types";

type SubField = "body" | "demeanor" | "movement";

interface ObserveScreenProps {
  raceId: string;
}

interface OpenCell {
  horseNo: number;
  field: ObservationField["key"];
}

export function ObserveScreen({ raceId }: ObserveScreenProps) {
  const router = useRouter();
  const { getRace, getMark, setObservationFields, getRaceProgress } = useStore();
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

  // 馬体・気配・動きのいずれかが変わるたび、レース内の全馬の総合(◎○△×)を
  // 自動採点し直して保存する。総合そのものは手入力させない(readOnly)。
  // 変更した馬については、手入力したフィールドと自動計算した総合を1回の
  // setObservationFields 呼び出しにまとめる(同じ行への書き込みを2回に
  // 分けると非同期の書き込みが競合し、DBの一意制約エラーになるため)。
  function recomputeOverall(
    changedHorseNo: number,
    changedField: SubField,
    changedMark: MarkValue | null
  ) {
    const updated = horses.map((h) => {
      const marks = marksByHorseNo[h.horseNo];
      const base = {
        horseNo: h.horseNo,
        body: marks.body,
        demeanor: marks.demeanor,
        movement: marks.movement,
      };
      return h.horseNo === changedHorseNo ? { ...base, [changedField]: changedMark } : base;
    });

    const computed = computeOverallMarks(updated);
    for (const h of horses) {
      const nextOverall = computed[h.horseNo] ?? null;
      const currentOverall = marksByHorseNo[h.horseNo].overall;
      const isChangedHorse = h.horseNo === changedHorseNo;

      if (isChangedHorse) {
        setObservationFields(raceId, h.horseNo, { [changedField]: changedMark, overall: nextOverall });
      } else if (nextOverall !== currentOverall) {
        setObservationFields(raceId, h.horseNo, { overall: nextOverall });
      }
    }
  }

  function handleOpenField(horseNo: number, field: ObservationField["key"]) {
    if (field === "overall") return;
    setOpenCell((prev) =>
      prev && prev.horseNo === horseNo && prev.field === field ? null : { horseNo, field }
    );
  }

  function handleClearField(horseNo: number, field: ObservationField["key"]) {
    if (field === "overall") return;
    recomputeOverall(horseNo, field, null);
  }

  function handleSelectMark(horseNo: number, field: ObservationField["key"], mark: MarkValue) {
    if (field === "overall") return;
    setOpenCell(null);
    recomputeOverall(horseNo, field, mark);
  }

  return (
    <main className="mx-auto max-w-[380px] p-3 pb-28">
      <header className="sticky top-0 z-10 mb-3 flex items-start justify-between gap-2 rounded-[14px] border border-border bg-card px-3 py-3">
        <div>
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground"
          >
            ← レース一覧
          </Link>
          <p className="mt-1.5 text-xs text-muted">
            {race.track} ・ {race.date}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-base font-bold text-foreground">{race.raceNo}R</p>
            <Link href={`/races/${raceId}/edit`} className="text-xs text-muted underline">
              編集
            </Link>
          </div>
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

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background px-3 py-3">
        <div className="mx-auto max-w-[380px]">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="h-12 w-full rounded-[11px] bg-accent text-base font-semibold text-accent-foreground"
          >
            入力完了
          </button>
        </div>
      </div>
    </main>
  );
}
