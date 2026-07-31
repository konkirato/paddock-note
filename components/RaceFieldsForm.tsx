"use client";

import { HEADS_OPTIONS, RACE_NUMBERS, TRACKS } from "@/lib/raceOptions";

interface RaceFieldsFormProps {
  track: string;
  onTrackChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  raceNo: number;
  onRaceNoChange: (value: number) => void;
  heads: number;
  onHeadsChange: (value: number) => void;
  onSubmit: (event: React.FormEvent) => void;
  submitLabel: string;
  children?: React.ReactNode;
}

export function RaceFieldsForm({
  track,
  onTrackChange,
  date,
  onDateChange,
  raceNo,
  onRaceNoChange,
  heads,
  onHeadsChange,
  onSubmit,
  submitLabel,
  children,
}: RaceFieldsFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-4"
    >
      <Field label="競馬場">
        <select
          value={track}
          onChange={(e) => onTrackChange(e.target.value)}
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
          onChange={(e) => onDateChange(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-card px-3 text-base text-foreground"
        />
      </Field>

      <Field label="レース番号">
        <select
          value={raceNo}
          onChange={(e) => onRaceNoChange(Number(e.target.value))}
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
          onChange={(e) => onHeadsChange(Number(e.target.value))}
          className="h-11 w-full rounded-lg border border-border bg-card px-3 text-base text-foreground"
        >
          {HEADS_OPTIONS.map((h) => (
            <option key={h} value={h}>
              {h}頭
            </option>
          ))}
        </select>
      </Field>

      {children}

      <button
        type="submit"
        className="h-12 w-full rounded-[11px] bg-accent text-base font-semibold text-accent-foreground"
      >
        {submitLabel}
      </button>
    </form>
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
