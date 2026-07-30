"use client";

import { useCallback, useRef } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delayMs?: number;
  moveThresholdPx?: number;
}

// タップは onClick、delayMs 以上の押下は onLongPress を呼ぶ。
// 押下中に moveThresholdPx を超えて動く/指が離れる/キャンセルされると
// ジェスチャー自体を中断し、どちらのコールバックも呼ばない。
export function useLongPress({
  onLongPress,
  onClick,
  delayMs = 500,
  moveThresholdPx = 10,
}: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedLongPressRef = useRef(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const abort = useCallback(() => {
    clearTimer();
    startPointRef.current = null;
  }, [clearTimer]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      firedLongPressRef.current = false;
      startPointRef.current = { x: event.clientX, y: event.clientY };
      timerRef.current = setTimeout(() => {
        firedLongPressRef.current = true;
        onLongPress();
      }, delayMs);
    },
    [delayMs, onLongPress]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent) => {
      const start = startPointRef.current;
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.hypot(dx, dy) > moveThresholdPx) {
        abort();
      }
    },
    [abort, moveThresholdPx]
  );

  const onPointerUp = useCallback(() => {
    const wasLongPress = firedLongPressRef.current;
    clearTimer();
    startPointRef.current = null;
    if (!wasLongPress) {
      onClick?.();
    }
  }, [clearTimer, onClick]);

  const onPointerLeave = useCallback(() => {
    abort();
  }, [abort]);

  const onPointerCancel = useCallback(() => {
    abort();
  }, [abort]);

  const onContextMenu = useCallback((event: ReactMouseEvent) => {
    event.preventDefault();
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onPointerCancel,
    onContextMenu,
  };
}
