import type { MarkValue } from "@/types";

const MARK_VALUES: MarkValue[] = ["◎", "○", "△", "×"];

interface MarkSelectorBarProps {
  horseNo: number;
  fieldLabel: string;
  currentMark: MarkValue | null;
  onSelect: (mark: MarkValue) => void;
}

export function MarkSelectorBar({
  horseNo,
  fieldLabel,
  currentMark,
  onSelect,
}: MarkSelectorBarProps) {
  return (
    <div className="flex flex-col gap-2 border-y border-border bg-background px-3 py-3">
      <p className="text-xs text-muted">
        {horseNo}番・{fieldLabel}
      </p>
      <div className="flex gap-1.5">
        {MARK_VALUES.map((mark) => {
          const isSelected = mark === currentMark;
          return (
            <button
              key={mark}
              type="button"
              onClick={() => onSelect(mark)}
              className={`h-11 flex-1 rounded-lg border text-lg font-bold ${
                isSelected
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card text-foreground"
              }`}
            >
              {mark}
            </button>
          );
        })}
      </div>
    </div>
  );
}
