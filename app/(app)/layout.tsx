import { BottomNav } from "@/components/BottomNav";
import { LogoutButton } from "@/components/LogoutButton";
import { Providers } from "@/app/providers";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <LogoutButton />
      <div className="flex-1">{children}</div>
      <BottomNav />
    </Providers>
  );
}
