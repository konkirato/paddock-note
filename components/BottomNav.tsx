"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "レース一覧" },
  { href: "/stats", label: "統計" },
] as const;

// 観察入力・結果入力画面は保存ボタンが画面下部に固定されるため、
// 装飾を増やさないようにボトムナビは表示しない。
function shouldHide(pathname: string) {
  return pathname.includes("/observe") || pathname.includes("/result");
}

export function BottomNav() {
  const pathname = usePathname();

  if (shouldHide(pathname)) {
    return null;
  }

  return (
    <nav className="sticky bottom-0 z-20 flex border-t border-border bg-background">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 min-h-14 flex items-center justify-center text-sm font-medium ${
              isActive ? "text-foreground" : "text-foreground/60"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
