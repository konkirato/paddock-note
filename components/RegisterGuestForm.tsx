"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

// ゲスト(匿名ユーザー)にメールアドレスとパスワードを紐づけて通常ユーザーにする。
// ユーザーIDは変わらないので、ゲスト中に入力したデータはそのまま引き継がれる。
export function RegisterGuestForm() {
  const router = useRouter();
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

    const { data, error } = await createClient().auth.updateUser({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Supabaseの「Confirm email」がオンの場合は確認メールのリンクを開くまで
    // ゲストのまま。オフならこの時点で登録完了。
    if (data.user.is_anonymous) {
      setNotice("確認メールを送信しました。メール内のリンクを開くと登録が完了します。");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-4"
    >
      <div>
        <p className="text-base font-bold text-foreground">メールアドレスを登録</p>
        <p className="mt-0.5 text-xs text-muted">
          ゲストで入力したデータはそのまま引き継がれます。登録すると別の端末からもログインできます。
        </p>
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
        登録する
      </button>
    </form>
  );
}
