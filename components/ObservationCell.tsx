"use client";

import { useLongPress } from "@/hooks/useLongPress";
import type { MarkValue } from "@/types";

interface ObservationCellProps {
  mark: MarkValue | null;
  size: "lg" | "md";
  onOpen: () => void;
  onClear: () => void;
}

const SIZE_CLASSES: Record<ObservationCellProps["size"], string> = {
  lg: "h-12 w-12 text-lg",
  md: "h-11 w-11 text-base",
};

export function ObservationCell({ mark, size, onOpen, onClear }: ObservationCellProps) {
  const longPress = useLongPress({
    onLongPress: onClear,
    onClick: onOpen,
  });

  const hasMark = mark !== null;

  return (
    <button
      type="button"
      {...longPress}
      className={`shrink-0 touch-manipulation select-none rounded-lg border font-bold ${SIZE_CLASSES[size]} ${
        hasMark
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card text-foreground"
      }`}
    >
      {mark ?? ""}
    </button>
  );
}
