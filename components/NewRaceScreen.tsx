"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useStore } from "@/lib/store";

const TRACKS = ["札幌", "函館", "福島", "新潟", "東京", "中山", "中京", "京都", "阪神", "小倉"];
const RACE_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);
const HEADS_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 5); // 5〜18

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function NewRaceScreen() {
  const router = useRouter();
  const { addRace } = useStore();

  const [track, setTrack] = useState(TRACKS[5]); // 中山
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

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-4"
      >
        <Field label="競馬場">
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-card px-3 text-base text-foreground"
          >
            {TRACKS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="開催日">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-card px-3 text-base text-foreground"
          />
        </Field>

        <Field label="レース番号">
          <select
            value={raceNo}
            onChange={(e) => setRaceNo(Number(e.target.value))}
            className="h-11 w-full rounded-lg border border-border bg-card px-3 text-base text-foreground"
          >
            {RACE_NUMBERS.map((n) => (
              <option key={n} value={n}>
                {n}R
              </option>
            ))}
          </select>
        </Field>

        <Field label="頭数">
          <select
            value={heads}
            onChange={(e) => setHeads(Number(e.target.value))}
            className="h-11 w-full rounded-lg border border-border bg-card px-3 text-base text-foreground"
          >
            {HEADS_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h}頭
              </option>
            ))}
          </select>
        </Field>

        <button
          type="submit"
          className="h-12 w-full rounded-[11px] bg-accent text-base font-semibold text-accent-foreground"
        >
          レースを作成
        </button>
      </form>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}
