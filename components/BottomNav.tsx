"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isImmersiveRoute } from "@/lib/routeVisibility";

const NAV_ITEMS = [
  { href: "/", label: "ホーム" },
  { href: "/races", label: "レース一覧" },
  { href: "/stats", label: "統計" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  if (isImmersiveRoute(pathname)) {
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
