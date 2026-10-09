import { createClient } from "@supabase/supabase-js";

// Supabaseの無料プランは1週間アクセスがないとプロジェクトが自動停止するため、
// Vercel Cron(vercel.json)から1日1回呼び出してDBに軽いクエリを投げる。
// 匿名キー＋RLSなので結果は常に空で、データは返さない。
export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { error } = await supabase.from("races").select("id").limit(1);
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
