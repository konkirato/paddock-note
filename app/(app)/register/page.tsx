import Link from "next/link";

import { RegisterGuestForm } from "@/components/RegisterGuestForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-[380px] p-3">
      <Link href="/" className="mb-3 inline-block text-xs text-muted underline">
        ← ホームに戻る
      </Link>
      <RegisterGuestForm />
    </main>
  );
}
