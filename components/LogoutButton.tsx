"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { useClickOutside } from "@/hooks/useClickOutside";
import { isImmersiveRoute } from "@/lib/routeVisibility";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setConfirming(false), confirming);

  if (isImmersiveRoute(pathname)) {
    return null;
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={containerRef} className="fixed right-3 top-3 z-30">
      <button
        type="button"
        onClick={() => setConfirming((v) => !v)}
        className="flex h-9 items-center justify-center rounded-full border border-border bg-card px-3 text-xs font-medium text-muted shadow-sm"
      >
        ログアウト
      </button>

      {confirming && (
        <div className="absolute right-0 mt-2 w-48 rounded-[14px] border border-border bg-card p-3 shadow-lg">
          <p className="mb-2 text-xs text-foreground">ログアウトしますか？</p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="h-9 flex-1 rounded-lg border border-border bg-card text-xs text-foreground"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="h-9 flex-1 rounded-lg bg-red-600 text-xs font-semibold text-white"
            >
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
