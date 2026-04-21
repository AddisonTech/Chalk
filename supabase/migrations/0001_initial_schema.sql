-- Chalk initial schema
-- Football intelligence platform: teams, plays, recruits, reports.

create extension if not exists "uuid-ossp";

-- ============================================
-- TEAMS
-- ============================================
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  school text,
  level text check (level in ('high_school', 'juco', 'naia', 'd3', 'd2', 'fcs', 'fbs', 'nfl')),
  state text,
  conference text,
  offensive_system text,
  defensive_system text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- PROFILES
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  team_id uuid references public.teams(id),
  full_name text,
  role text check (role in ('head_coach', 'coordinator', 'position_coach', 'analyst', 'recruiting', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- OPPONENTS
-- ============================================
create table public.opponents (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  name text not null,
  school text,
  level text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- GAMES
-- ============================================
create table public.games (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  opponent_id uuid references public.opponents(id),
  season integer not null,
  week integer,
  game_date date,
  location text,
  is_home boolean default true,
  result text check (result in ('win', 'loss', 'tie')),
  score_us integer,
  score_them integer,
  game_type text check (game_type in ('regular', 'playoff', 'scrimmage', 'spring')),
  is_self_scout boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- PLAYS
-- ============================================
create table public.plays (
  id uuid default uuid_generate_v4() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  team_id uuid references public.teams(id) on delete cascade not null,

  quarter integer check (quarter between 1 and 5),
  down integer check (down between 1 and 4),
  distance integer,
  yard_line integer,
  field_zone text check (field_zone in ('backed_up', 'own_territory', 'midfield', 'opponent_territory', 'red_zone', 'goal_line')),
  hash_mark text check (hash_mark in ('left', 'middle', 'right')),

  formation text,
  personnel text,
  motion text,
  shift text,

  play_type text check (play_type in ('run', 'pass', 'rpo', 'screen', 'trick', 'qb_run', 'penalty', 'special_teams')),
  play_direction text check (play_direction in ('left', 'right', 'middle', 'na')),
  concept text,
  pass_depth text check (pass_depth in ('behind_los', 'short', 'intermediate', 'deep', 'na')),

  defensive_front text,
  coverage text,
  pressure text check (pressure in ('none', 'blitz', 'simulated', 'stunt')),
  pressure_result text,

  result text check (result in ('complete', 'incomplete', 'interception', 'fumble', 'sack', 'td', 'first_down', 'no_gain', 'positive', 'negative', 'penalty')),
  yards_gained integer,
  is_explosive boolean default false,
  is_negative boolean default false,

  play_number integer,
  notes text,
  tags text[],
  created_at timestamptz default now()
);

-- ============================================
-- PLAYERS
-- ============================================
create table public.players (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  name text not null,
  number integer,
  position text,
  year text check (year in ('fr', 'so', 'jr', 'sr', 'rs_fr', 'rs_so', 'rs_jr', 'rs_sr', 'grad', 'na')),
  height text,
  weight integer,
  is_active boolean default true,
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- RECRUITS
-- ============================================
create table public.recruits (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,

  name text not null,
  position text,
  class_year integer,
  high_school text,
  city text,
  state text,

  height text,
  weight integer,
  forty_yard numeric(4,2),
  shuttle numeric(5,2),
  vertical numeric(4,1),
  broad_jump numeric(4,1),

  film_grade numeric(3,1),
  athleticism_grade numeric(3,1),
  technique_grade numeric(3,1),
  football_iq_grade numeric(3,1),
  scheme_fit_score numeric(3,1),

  tier text check (tier in ('take', 'developmental', 'watch', 'pass')),
  priority integer,
  offer_status text check (offer_status in ('not_offered', 'offered', 'committed', 'signed', 'decommitted')),

  player_comp text,
  comp_player_id uuid references public.players(id),

  strengths text,
  weaknesses text,
  development_notes text,
  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- REPORTS
-- ============================================
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  created_by uuid references public.profiles(id),

  report_type text check (report_type in ('opponent_tendency', 'self_scout', 'game_plan', 'recruit_eval', 'weekly_summary')),
  title text not null,
  game_ids uuid[],
  recruit_ids uuid[],

  content jsonb not null,
  recommendations jsonb,

  created_at timestamptz default now()
);

-- ============================================
-- SCHEME PROFILES
-- ============================================
create table public.scheme_profiles (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null unique,

  offensive_system text,
  defensive_system text,
  base_formations jsonb,
  base_concepts jsonb,
  positional_requirements jsonb,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_plays_game on public.plays(game_id);
create index idx_plays_team on public.plays(team_id);
create index idx_plays_situation on public.plays(down, distance, field_zone);
create index idx_plays_formation on public.plays(formation, personnel);
create index idx_plays_type on public.plays(play_type, concept);
create index idx_games_team on public.games(team_id);
create index idx_games_opponent on public.games(opponent_id);
create index idx_recruits_team on public.recruits(team_id);
create index idx_recruits_position on public.recruits(position, tier);
create index idx_reports_team on public.reports(team_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_teams_updated before update on public.teams
  for each row execute function public.handle_updated_at();

create trigger on_profiles_updated before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_recruits_updated before update on public.recruits
  for each row execute function public.handle_updated_at();

create trigger on_scheme_profiles_updated before update on public.scheme_profiles
  for each row execute function public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.teams enable row level security;
alter table public.profiles enable row level security;
alter table public.opponents enable row level security;
alter table public.games enable row level security;
alter table public.plays enable row level security;
alter table public.players enable row level security;
alter table public.recruits enable row level security;
alter table public.reports enable row level security;
alter table public.scheme_profiles enable row level security;

-- Profile — own row only.
create policy "Users see own profile"
  on public.profiles for select using (id = auth.uid());

create policy "Users insert own profile"
  on public.profiles for insert with check (id = auth.uid());

create policy "Users update own profile"
  on public.profiles for update using (id = auth.uid());

-- Teams — member read, self-register on create.
create policy "Users see own team"
  on public.teams for select
  using (id = (select team_id from public.profiles where id = auth.uid()));

create policy "Authed users can create a team"
  on public.teams for insert
  with check (auth.uid() is not null);

create policy "Users update own team"
  on public.teams for update
  using (id = (select team_id from public.profiles where id = auth.uid()));

-- Team-scoped tables: all access gated by profiles.team_id.
create policy "Team members see team opponents"
  on public.opponents for all
  using (team_id = (select team_id from public.profiles where id = auth.uid()))
  with check (team_id = (select team_id from public.profiles where id = auth.uid()));

create policy "Team members see team games"
  on public.games for all
  using (team_id = (select team_id from public.profiles where id = auth.uid()))
  with check (team_id = (select team_id from public.profiles where id = auth.uid()));

create policy "Team members see team plays"
  on public.plays for all
  using (team_id = (select team_id from public.profiles where id = auth.uid()))
  with check (team_id = (select team_id from public.profiles where id = auth.uid()));

create policy "Team members see team players"
  on public.players for all
  using (team_id = (select team_id from public.profiles where id = auth.uid()))
  with check (team_id = (select team_id from public.profiles where id = auth.uid()));

create policy "Team members see team recruits"
  on public.recruits for all
  using (team_id = (select team_id from public.profiles where id = auth.uid()))
  with check (team_id = (select team_id from public.profiles where id = auth.uid()));

create policy "Team members see team reports"
  on public.reports for all
  using (team_id = (select team_id from public.profiles where id = auth.uid()))
  with check (team_id = (select team_id from public.profiles where id = auth.uid()));

create policy "Team members see team scheme"
  on public.scheme_profiles for all
  using (team_id = (select team_id from public.profiles where id = auth.uid()))
  with check (team_id = (select team_id from public.profiles where id = auth.uid()));
