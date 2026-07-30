create table public.races (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  track text not null,
  date date not null,
  race_no integer not null,
  heads integer not null,
  created_at timestamptz not null default now()
);

create table public.observations (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  race_id uuid not null references public.races(id) on delete cascade,
  horse_no integer not null,
  overall text check (overall in ('◎','○','△','×')),
  body text check (body in ('◎','○','△','×')),
  demeanor text check (demeanor in ('◎','○','△','×')),
  movement text check (movement in ('◎','○','△','×')),
  memo text,
  created_at timestamptz not null default now(),
  unique (race_id, horse_no)
);

create table public.results (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  race_id uuid not null references public.races(id) on delete cascade,
  horse_no integer not null,
  finish text not null check (finish in ('1着','2着','3着','着外')),
  odds_band text not null check (odds_band in ('~2.0','~5.0','~10.0','~20.0','20.0~')),
  created_at timestamptz not null default now(),
  unique (race_id, horse_no)
);

create index observations_race_id_idx on public.observations(race_id);
create index results_race_id_idx on public.results(race_id);

alter table public.races enable row level security;
alter table public.observations enable row level security;
alter table public.results enable row level security;

create policy "races_own" on public.races for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "observations_own" on public.observations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "results_own" on public.results for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
