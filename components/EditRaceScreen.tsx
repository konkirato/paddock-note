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
  const { getRace, updateRace, deleteRace } = useStore();
  const race = getRace(raceId);

  const [track, setTrack] = useState(race?.track ?? "中山");
  const [date, setDate] = useState(race?.date ?? "");
  const [raceNo, setRaceNo] = useState(race?.raceNo ?? 11);
  const [heads, setHeads] = useState(race?.heads ?? 16);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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

  function handleDelete() {
    deleteRace(raceId);
    router.push("/races");
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

      {confirmingDelete ? (
        <div className="mt-4 flex flex-col gap-2 rounded-[14px] border border-red-200 bg-red-50 p-3.5">
          <p className="text-xs text-red-700">
            このレースの観察・結果データもすべて削除されます。元に戻せません。よろしいですか？
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="h-10 flex-1 rounded-lg border border-border bg-card text-sm text-foreground"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="h-10 flex-1 rounded-lg bg-red-600 text-sm font-semibold text-white"
            >
              削除する
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="mt-4 h-11 w-full rounded-[11px] border border-red-200 text-sm font-semibold text-red-600"
        >
          レースを削除
        </button>
      )}
    </main>
  );
}
