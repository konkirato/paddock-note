import { redirect } from "next/navigation";

import { LoginForm } from "@/components/LoginForm";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-full max-w-[380px] flex-col justify-center p-3">
      <LoginForm />
    </main>
  );
}
