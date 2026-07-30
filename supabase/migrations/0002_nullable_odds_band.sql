-- 単勝オッズ帯が未入力でも着順だけで結果を確定できるようにする。
-- (的中率の集計にはオッズ不要なため、オッズ未入力でも結果を保存できるようにする)
alter table public.results alter column odds_band drop not null;
