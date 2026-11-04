-- Make the Number: Supabase schema
-- Run once in the Supabase SQL editor of a NEW project (separate from Mo + Mileage).

-- Rooms: one per class session. Only the signed-in host can change a room.
create table if not exists public.rooms (
  code text primary key check (code ~ '^[A-Z]{4}$'),
  host_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  state jsonb not null default '{"step":0,"kind":"lobby","round":null,"deadline":null}'::jsonb,
  created_at timestamptz not null default now()
);

-- Teams: created only through join_team(). The secret lives in its own table nobody can read.
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  room_code text not null references public.rooms (code) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  created_at timestamptz not null default now(),
  unique (room_code, name)
);

create table if not exists public.team_secrets (
  team_id uuid primary key references public.teams (id) on delete cascade,
  secret uuid not null default gen_random_uuid()
);

-- Answers: one row per team per round. Round 0-4 = case rounds (choice is a letter), round 5 = board (choice is an array of fix ids).
create table if not exists public.answers (
  team_id uuid not null references public.teams (id) on delete cascade,
  room_code text not null references public.rooms (code) on delete cascade,
  round int not null check (round between 0 and 5),
  choice jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (team_id, round)
);

alter table public.rooms enable row level security;
alter table public.teams enable row level security;
alter table public.team_secrets enable row level security;
alter table public.answers enable row level security;

-- Everyone (the projector, the phones) can read rooms, teams and answers.
drop policy if exists rooms_read on public.rooms;
create policy rooms_read on public.rooms for select using (true);
drop policy if exists teams_read on public.teams;
create policy teams_read on public.teams for select using (true);
drop policy if exists answers_read on public.answers;
create policy answers_read on public.answers for select using (true);

-- Only the host writes rooms.
drop policy if exists rooms_insert on public.rooms;
create policy rooms_insert on public.rooms for insert to authenticated with check (host_id = auth.uid());
drop policy if exists rooms_update on public.rooms;
create policy rooms_update on public.rooms for update to authenticated using (host_id = auth.uid()) with check (host_id = auth.uid());
drop policy if exists rooms_delete on public.rooms;
create policy rooms_delete on public.rooms for delete to authenticated using (host_id = auth.uid());

-- The host can add, override and clear answers and remove teams in their own rooms.
drop policy if exists answers_host_all on public.answers;
create policy answers_host_all on public.answers for all to authenticated
  using (exists (select 1 from public.rooms r where r.code = room_code and r.host_id = auth.uid()))
  with check (exists (select 1 from public.rooms r where r.code = room_code and r.host_id = auth.uid()));
drop policy if exists teams_host_delete on public.teams;
create policy teams_host_delete on public.teams for delete to authenticated
  using (exists (select 1 from public.rooms r where r.code = room_code and r.host_id = auth.uid()));
drop policy if exists teams_host_insert on public.teams;
create policy teams_host_insert on public.teams for insert to authenticated
  with check (exists (select 1 from public.rooms r where r.code = room_code and r.host_id = auth.uid()));

-- Phones join through this function (no account needed).
create or replace function public.join_team(p_code text, p_name text)
returns json language plpgsql security definer set search_path = public as $$
declare v_team uuid; v_secret uuid; v_name text := btrim(p_name);
begin
  if not exists (select 1 from rooms where code = upper(p_code)) then
    raise exception 'room_not_found';
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 24 then
    raise exception 'bad_name';
  end if;
  if (select count(*) from teams where room_code = upper(p_code)) >= 20 then
    raise exception 'room_full';
  end if;
  begin
    insert into teams (room_code, name) values (upper(p_code), v_name) returning id into v_team;
  exception when unique_violation then
    raise exception 'name_taken';
  end;
  insert into team_secrets (team_id) values (v_team) returning secret into v_secret;
  return json_build_object('team_id', v_team, 'secret', v_secret, 'room_code', upper(p_code), 'name', v_name);
end $$;

-- Phones submit answers through this function. It checks the team secret, that the
-- round is open on the projector, and that the timer has not run out (3 s grace).
create or replace function public.submit_answer(p_team uuid, p_secret uuid, p_round int, p_choice jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_room text; v_state jsonb;
begin
  select t.room_code into v_room from teams t join team_secrets s on s.team_id = t.id
   where t.id = p_team and s.secret = p_secret;
  if v_room is null then raise exception 'not_your_team'; end if;
  select state into v_state from rooms where code = v_room;
  if (v_state->>'kind') not in ('question', 'board') or (v_state->>'round')::int <> p_round then
    raise exception 'round_closed';
  end if;
  if v_state->>'deadline' is not null and now() > (v_state->>'deadline')::timestamptz + interval '3 seconds' then
    raise exception 'time_up';
  end if;
  if p_round between 0 and 4 and (jsonb_typeof(p_choice) <> 'string' or char_length(p_choice #>> '{}') <> 1) then
    raise exception 'bad_choice';
  end if;
  if p_round = 5 and jsonb_typeof(p_choice) <> 'array' then
    raise exception 'bad_choice';
  end if;
  insert into answers (team_id, room_code, round, choice, updated_at)
  values (p_team, v_room, p_round, p_choice, now())
  on conflict (team_id, round) do update set choice = excluded.choice, updated_at = now();
end $$;

revoke all on function public.join_team(text, text) from public;
revoke all on function public.submit_answer(uuid, uuid, int, jsonb) from public;
grant execute on function public.join_team(text, text) to anon, authenticated;
grant execute on function public.submit_answer(uuid, uuid, int, jsonb) to anon, authenticated;

-- Live updates for the projector, the phones and the host panel.
alter table public.rooms replica identity full;
alter table public.teams replica identity full;
alter table public.answers replica identity full;
do $$ begin
  begin alter publication supabase_realtime add table public.rooms; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.teams; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.answers; exception when duplicate_object then null; end;
end $$;
