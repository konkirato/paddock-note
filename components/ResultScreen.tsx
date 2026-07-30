"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useStore } from "@/lib/store";
import type { FinishPosition, OddsBand } from "@/types";

interface ResultScreenProps {
  raceId: string;
}

const FINISH_OPTIONS: FinishPosition[] = ["1着", "2着", "3着", "着外"];
const ODDS_OPTIONS: OddsBand[] = ["~2.0", "~5.0", "~10.0", "~20.0", "20.0~"];

interface PendingResult {
  finish: FinishPosition | null;
  oddsBand: OddsBand | null;
}

export function ResultScreen({ raceId }: ResultScreenProps) {
  const router = useRouter();
  const { getRace, getObservationsForRace, getResult, setResult } = useStore();

  const race = getRace(raceId);
  const targets = getObservationsForRace(raceId)
    .filter((o) => o.overall === "◎" || o.overall === "○" || o.overall === "△")
    .sort((a, b) => a.horseNo - b.horseNo);

  const [pending, setPending] = useState<Record<number, PendingResult>>(() => {
    const initial: Record<number, PendingResult> = {};
    for (const o of targets) {
      const existing = getResult(raceId, o.horseNo);
      initial[o.horseNo] = {
        finish: existing?.finish ?? null,
        oddsBand: existing?.oddsBand ?? null,
      };
    }
    return initial;
  });

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

  function updateField(horseNo: number, patch: Partial<PendingResult>) {
    const next = { ...pending[horseNo], ...patch };
    setPending((prev) => ({ ...prev, [horseNo]: next }));
    if (next.finish && next.oddsBand) {
      setResult(raceId, horseNo, next.finish, next.oddsBand);
    }
  }

  const doneCount = targets.filter(
    (o) => pending[o.horseNo]?.finish && pending[o.horseNo]?.oddsBand
  ).length;
  const allDone = targets.length > 0 && doneCount === targets.length;

  return (
    <main className="mx-auto max-w-[380px] p-3 pb-28">
      <header className="mb-3 rounded-[14px] border border-border bg-card px-3 py-3">
        <Link href={`/races/${raceId}/observe`} className="text-xs text-muted underline">
          ← 観察入力に戻る
        </Link>
        <p className="mt-0.5 text-xs text-muted">
          {race.track} ・ {race.date}
        </p>
        <p className="text-base font-bold text-foreground">{race.raceNo}R 結果を入力</p>
      </header>

      {targets.length === 0 ? (
        <p className="rounded-[14px] border border-border bg-card px-3 py-6 text-center text-sm text-muted">
          ◎○△をつけた馬がいません。先に観察入力をおこなってください。
        </p>
      ) : (
        <>
          <p className="mb-2 px-1.5 text-xs text-muted">◎○△をつけた馬の結果を入力します</p>
          <div className="flex flex-col gap-2">
            {targets.map((o) => (
              <div key={o.horseNo} className="rounded-[14px] border border-border bg-card p-3.5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-[30px] w-[30px] items-center justify-center rounded-md border border-border text-sm font-bold text-foreground">
                    {o.horseNo}
                  </span>
                  <span className="text-xl font-bold text-foreground">{o.overall}</span>
                  <span className="text-xs text-muted">自分の評価</span>
                </div>

                <p className="mb-1.5 text-[11px] text-muted">着順</p>
                <div className="mb-3 flex gap-1.5">
                  {FINISH_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField(o.horseNo, { finish: opt })}
                      className={`h-10 flex-1 rounded-lg border text-sm tabular-nums ${
                        pending[o.horseNo]?.finish === opt
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-card text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <p className="mb-1.5 text-[11px] text-muted">単勝オッズ帯</p>
                <div className="flex gap-1.5">
                  {ODDS_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField(o.horseNo, { oddsBand: opt })}
                      className={`h-10 flex-1 rounded-lg border text-xs ${
                        pending[o.horseNo]?.oddsBand === opt
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-card text-foreground"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background px-3 py-3">
        <div className="mx-auto max-w-[380px]">
          <p className="mb-2 text-center text-xs text-muted">
            {doneCount} / {targets.length} 頭 入力済み
          </p>
          <button
            type="button"
            disabled={!allDone}
            onClick={() => router.push("/")}
            className="h-12 w-full rounded-[11px] bg-accent text-base font-semibold text-accent-foreground disabled:bg-border disabled:text-muted"
          >
            結果を保存
          </button>
        </div>
      </div>
    </main>
  );
}
