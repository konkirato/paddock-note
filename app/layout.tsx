import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
