import { BottomNav } from "@/components/BottomNav";
import { Providers } from "@/app/providers";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div className="flex-1">{children}</div>
      <BottomNav />
    </Providers>
  );
}
