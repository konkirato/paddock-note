"use client";

import Link from "next/link";

import { useIsGuest } from "@/hooks/useIsGuest";

export function GuestBanner() {
  const isGuest = useIsGuest();
  if (!isGuest) return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2.5">
      <p className="flex-1 text-xs text-amber-900">
        ゲストで利用中です。ログアウトや別の端末ではデータを開けません。
      </p>
      <Link
        href="/register"
        className="shrink-0 rounded-full bg-amber-900 px-3 py-1.5 text-xs font-semibold text-white"
      >
        登録する
      </Link>
    </div>
  );
}
