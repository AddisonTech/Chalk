-- Chalk: initial schema
-- Tables: teams, team_members, films, plays, prospects, prospect_grades, game_plans
-- All tables use uuid primary keys and reference auth.users for ownership.

create extension if not exists "pgcrypto";

-- Teams ----------------------------------------------------------------------

create table public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_by  uuid not null references auth.users(id) on delete restrict,
  created_at  timestamptz not null default now()
);

-- Team membership ------------------------------------------------------------

create type public.team_role as enum ('owner', 'coach', 'analyst', 'viewer');

create table public.team_members (
  team_id   uuid not null references public.teams(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      public.team_role not null default 'viewer',
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index team_members_user_idx on public.team_members(user_id);

-- Films ----------------------------------------------------------------------

create table public.films (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  title       text not null,
  opponent    text,
  game_date   date,
  upload_url  text,
  created_at  timestamptz not null default now()
);

create index films_team_idx on public.films(team_id);
create index films_game_date_idx on public.films(game_date desc);

-- Plays ----------------------------------------------------------------------

create type public.play_type as enum (
  'run', 'pass', 'screen', 'rpo', 'qb_run', 'punt', 'fg', 'kick', 'special', 'other'
);

create table public.plays (
  id              uuid primary key default gen_random_uuid(),
  film_id         uuid not null references public.films(id) on delete cascade,
  timestamp_start integer not null,                -- seconds into film
  timestamp_end   integer,
  down            smallint check (down between 1 and 4),
  distance        smallint check (distance >= 0),
  yard_line       smallint check (yard_line between 0 and 100),
  formation       text,
  personnel       text,
  motion          text,
  concept         text,
  play_type       public.play_type,
  result          text,
  notes           text,
  tagged_by       uuid not null references auth.users(id) on delete restrict,
  created_at      timestamptz not null default now()
);

create index plays_film_idx on public.plays(film_id);
create index plays_film_time_idx on public.plays(film_id, timestamp_start);

-- Prospects ------------------------------------------------------------------

create table public.prospects (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  name        text not null,
  position    text,
  school      text,
  grad_year   smallint,
  height      text,                                -- e.g. "6'2""
  weight      smallint,                            -- pounds
  gpa         numeric(3,2),
  film_url    text,
  notes       text,
  created_by  uuid not null references auth.users(id) on delete restrict,
  created_at  timestamptz not null default now()
);

create index prospects_team_idx on public.prospects(team_id);
create index prospects_grad_year_idx on public.prospects(grad_year);

-- Prospect grades ------------------------------------------------------------

create table public.prospect_grades (
  id           uuid primary key default gen_random_uuid(),
  prospect_id  uuid not null references public.prospects(id) on delete cascade,
  trait        text not null,
  score        smallint not null check (score between 1 and 10),
  notes        text,
  graded_by    uuid not null references auth.users(id) on delete restrict,
  created_at   timestamptz not null default now()
);

create index prospect_grades_prospect_idx on public.prospect_grades(prospect_id);

-- Game plans -----------------------------------------------------------------

create table public.game_plans (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  opponent    text not null,
  week        smallint,
  game_date   date,
  notes       text,
  created_by  uuid not null references auth.users(id) on delete restrict,
  created_at  timestamptz not null default now()
);

create index game_plans_team_idx on public.game_plans(team_id);
create index game_plans_game_date_idx on public.game_plans(game_date desc);

-- Row-level security ---------------------------------------------------------

alter table public.teams            enable row level security;
alter table public.team_members     enable row level security;
alter table public.films            enable row level security;
alter table public.plays            enable row level security;
alter table public.prospects        enable row level security;
alter table public.prospect_grades  enable row level security;
alter table public.game_plans       enable row level security;

-- Helper: is the current user a member of the given team?
create or replace function public.is_team_member(team uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.team_members
    where team_id = team and user_id = auth.uid()
  );
$$;

-- teams: members can read; only the creator can update/delete; any auth user can create
create policy teams_select on public.teams
  for select using (public.is_team_member(id));

create policy teams_insert on public.teams
  for insert with check (auth.uid() = created_by);

create policy teams_update on public.teams
  for update using (auth.uid() = created_by);

create policy teams_delete on public.teams
  for delete using (auth.uid() = created_by);

-- team_members: a user can see their own memberships; team owners manage them
create policy team_members_select on public.team_members
  for select using (user_id = auth.uid() or public.is_team_member(team_id));

create policy team_members_insert on public.team_members
  for insert with check (
    exists (select 1 from public.teams t where t.id = team_id and t.created_by = auth.uid())
    or user_id = auth.uid()
  );

create policy team_members_delete on public.team_members
  for delete using (
    exists (select 1 from public.teams t where t.id = team_id and t.created_by = auth.uid())
    or user_id = auth.uid()
  );

-- films, plays, prospects, prospect_grades, game_plans:
-- team members can do everything within their team scope.

create policy films_all on public.films
  for all using (public.is_team_member(team_id))
  with check (public.is_team_member(team_id));

create policy plays_all on public.plays
  for all using (
    exists (select 1 from public.films f where f.id = film_id and public.is_team_member(f.team_id))
  )
  with check (
    exists (select 1 from public.films f where f.id = film_id and public.is_team_member(f.team_id))
  );

create policy prospects_all on public.prospects
  for all using (public.is_team_member(team_id))
  with check (public.is_team_member(team_id));

create policy prospect_grades_all on public.prospect_grades
  for all using (
    exists (select 1 from public.prospects p where p.id = prospect_id and public.is_team_member(p.team_id))
  )
  with check (
    exists (select 1 from public.prospects p where p.id = prospect_id and public.is_team_member(p.team_id))
  );

create policy game_plans_all on public.game_plans
  for all using (public.is_team_member(team_id))
  with check (public.is_team_member(team_id));
