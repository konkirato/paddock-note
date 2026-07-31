"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { RaceFieldsForm } from "@/components/RaceFieldsForm";
import { useStore } from "@/lib/store";

interface EditRaceScreenProps {
  raceId: string;
}

export function EditRaceScreen({ raceId }: EditRaceScreenProps) {
  const router = useRouter();
  const { getRace, updateRace } = useStore();
  const race = getRace(raceId);

  const [track, setTrack] = useState(race?.track ?? "中山");
  const [date, setDate] = useState(race?.date ?? "");
  const [raceNo, setRaceNo] = useState(race?.raceNo ?? 11);
  const [heads, setHeads] = useState(race?.heads ?? 16);

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

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateRace(raceId, { track, date, raceNo, heads });
    router.push(`/races/${raceId}/observe`);
  }

  return (
    <main className="mx-auto max-w-[380px] p-3">
      <header className="mb-3 rounded-[14px] border border-border bg-card px-3 py-3">
        <Link href={`/races/${raceId}/observe`} className="text-xs text-muted underline">
          ← 観察入力に戻る
        </Link>
        <p className="mt-0.5 text-base font-bold text-foreground">レース情報を編集</p>
      </header>

      <RaceFieldsForm
        track={track}
        onTrackChange={setTrack}
        date={date}
        onDateChange={setDate}
        raceNo={raceNo}
        onRaceNoChange={setRaceNo}
        heads={heads}
        onHeadsChange={setHeads}
        onSubmit={handleSubmit}
        submitLabel="保存する"
      >
        {heads < race.heads && (
          <p className="text-xs text-muted">
            頭数を{race.heads}頭から{heads}頭に減らすと、{heads + 1}〜{race.heads}番の観察・結果データは削除されます。
          </p>
        )}
      </RaceFieldsForm>
    </main>
  );
}
