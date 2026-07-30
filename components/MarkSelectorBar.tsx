import type { MarkValue } from "@/types";

const MARK_VALUES: MarkValue[] = ["◎", "○", "△", "×"];

interface MarkSelectorBarProps {
  horseName: string;
  axisLabel: string;
  onSelect: (mark: MarkValue) => void;
}

export function MarkSelectorBar({ horseName, axisLabel, onSelect }: MarkSelectorBarProps) {
  return (
    <div className="flex flex-col gap-2 border-y-2 border-foreground bg-foreground/5 p-3">
      <p className="text-sm font-bold">
        {horseName} — {axisLabel}
      </p>
      <div className="flex gap-2">
        {MARK_VALUES.map((mark) => (
          <button
            key={mark}
            type="button"
            onClick={() => onSelect(mark)}
            className="min-h-11 min-w-11 flex-1 rounded-md border-2 border-foreground bg-background text-xl font-bold text-foreground active:bg-foreground active:text-background"
          >
            {mark}
          </button>
        ))}
      </div>
    </div>
  );
}
