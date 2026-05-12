-- Plays table.
-- Keyed off game_id (our schema) with timestamp_start / timestamp_end for video-position tagging.
-- tagged_by is nullable so seed plays can exist without a user reference.

create table public.plays (
  id               uuid default uuid_generate_v4() primary key,
  game_id          uuid references public.games(id)  on delete cascade not null,
  team_id          uuid references public.teams(id)  on delete cascade not null,

  timestamp_start  integer,
  timestamp_end    integer,

  quarter          integer     check (quarter between 1 and 5),
  down             integer     check (down between 1 and 4),
  distance         integer,
  yard_line        integer,
  field_zone       text        check (field_zone in ('backed_up','own_territory','midfield','opponent_territory','red_zone','goal_line')),
  hash_mark        text        check (hash_mark in ('left','middle','right')),

  formation        text,
  personnel        text,
  motion           text,
  shift            text,

  play_type        text        check (play_type in ('run','pass','rpo','screen','trick','qb_run','penalty','special_teams','punt','fg','kick','special','other')),
  play_direction   text        check (play_direction in ('left','right','middle','na')),
  concept          text,
  pass_depth       text        check (pass_depth in ('behind_los','short','intermediate','deep','na')),

  defensive_front  text,
  coverage         text,
  pressure         text        check (pressure in ('none','blitz','simulated','stunt')),
  pressure_result  text,

  result           text,
  yards_gained     integer,
  is_explosive     boolean     default false,
  is_negative      boolean     default false,

  play_number      integer,
  notes            text,
  tags             text[],
  tagged_by        uuid        references auth.users(id),

  created_at       timestamptz default now()
);

create index idx_plays_game      on public.plays(game_id);
create index idx_plays_team      on public.plays(team_id);
create index idx_plays_situation on public.plays(down, distance);
create index idx_plays_formation on public.plays(formation, personnel);
create index idx_plays_type      on public.plays(play_type, concept);

alter table public.plays enable row level security;

create policy "Team members see team plays"
  on public.plays for all
  using  (team_id = (select team_id from public.profiles where id = auth.uid()))
  with check (team_id = (select team_id from public.profiles where id = auth.uid()));
