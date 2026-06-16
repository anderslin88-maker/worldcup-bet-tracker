-- 在 Supabase SQL Editor 執行這段
create table if not exists public.bets (
  id uuid primary key default gen_random_uuid(),
  bet_date date not null,
  match_name text not null,
  bet_type text not null,
  selection text not null,
  odds numeric not null,
  stake numeric not null,
  result text not null default 'pending',
  note text,
  created_at timestamptz not null default now()
);

alter table public.bets enable row level security;

-- 第一版：公開可讀寫，方便手機直接使用。
-- 如果網址會公開給別人，建議之後改成需要登入。
drop policy if exists "Allow public read" on public.bets;
create policy "Allow public read"
on public.bets for select
using (true);

drop policy if exists "Allow public insert" on public.bets;
create policy "Allow public insert"
on public.bets for insert
with check (true);

drop policy if exists "Allow public update" on public.bets;
create policy "Allow public update"
on public.bets for update
using (true)
with check (true);

drop policy if exists "Allow public delete" on public.bets;
create policy "Allow public delete"
on public.bets for delete
using (true);
