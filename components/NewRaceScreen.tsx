"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { RaceFieldsForm } from "@/components/RaceFieldsForm";
import { useStore } from "@/lib/store";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function NewRaceScreen() {
  const router = useRouter();
  const { addRace } = useStore();

  const [track, setTrack] = useState("中山");
  const [date, setDate] = useState(todayIso);
  const [raceNo, setRaceNo] = useState(11);
  const [heads, setHeads] = useState(16);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const id = addRace({ track, date, raceNo, heads });
    router.push(`/races/${id}/observe`);
  }

  return (
    <main className="mx-auto max-w-[380px] p-3">
      <header className="mb-3 rounded-[14px] border border-border bg-card px-3 py-3">
        <Link href="/" className="text-xs text-muted underline">
          ← レース一覧に戻る
        </Link>
        <p className="mt-0.5 text-base font-bold text-foreground">新規レース</p>
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
        submitLabel="レースを作成"
      />
    </main>
  );
}
