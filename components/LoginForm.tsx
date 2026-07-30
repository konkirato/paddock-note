"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setSubmitting(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }
    setNotice("確認メールを送信しました。メール内のリンクを開いてから、ログインしてください。");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-4"
    >
      <div>
        <p className="text-base font-bold text-foreground">
          {mode === "login" ? "ログイン" : "新規登録"}
        </p>
        <p className="mt-0.5 text-xs text-muted">パドック観察ノート</p>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">メールアドレス</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-card px-3 text-base text-foreground"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs text-muted">パスワード</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-card px-3 text-base text-foreground"
        />
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {notice && <p className="text-xs text-muted">{notice}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-[11px] bg-accent text-base font-semibold text-accent-foreground disabled:opacity-50"
      >
        {mode === "login" ? "ログイン" : "登録する"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "login" ? "signup" : "login"));
          setError(null);
          setNotice(null);
        }}
        className="text-xs text-muted underline"
      >
        {mode === "login" ? "アカウントをお持ちでない方はこちら" : "既にアカウントをお持ちの方はこちら"}
      </button>
    </form>
  );
}
