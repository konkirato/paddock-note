"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

// ログイン中のユーザーが「登録せずに使う」で作られたゲスト(匿名ユーザー)かどうか。
// メールアドレス登録で通常ユーザーに切り替わったときも追従する。
export function useIsGuest() {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setIsGuest(data.session?.user.is_anonymous ?? false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsGuest(session?.user.is_anonymous ?? false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return isGuest;
}
