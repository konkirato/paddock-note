"use client";

import { useLongPress } from "@/hooks/useLongPress";
import type { MarkValue } from "@/types";

interface ObservationCellProps {
  mark: MarkValue | undefined;
  onOpen: () => void;
  onClear: () => void;
}

export function ObservationCell({ mark, onOpen, onClear }: ObservationCellProps) {
  const longPress = useLongPress({
    onLongPress: onClear,
    onClick: onOpen,
  });

  const hasMark = mark !== undefined;

  return (
    <td className="p-1 text-center">
      <button
        type="button"
        {...longPress}
        className={`min-h-11 min-w-11 w-full touch-manipulation select-none rounded-md border-2 text-lg font-bold ${
          hasMark
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background text-foreground"
        }`}
      >
        {mark ?? ""}
      </button>
    </td>
  );
}
