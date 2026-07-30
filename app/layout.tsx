import type { Metadata } from "next";
import "./globals.css";

import { BottomNav } from "@/components/BottomNav";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  title: "ソウマガン",
  description: "パドック観察の記録と答え合わせのためのノート",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" style={{ colorScheme: "light" }} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          <div className="flex-1">{children}</div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
