-- Extend the plays table created in 0001.
-- Adds video timestamp columns, tagged_by, removes the result enum constraint,
-- and expands the play_type constraint to include special-teams values.

alter table public.plays
  add column if not exists timestamp_start integer,
  add column if not exists timestamp_end   integer,
  add column if not exists tagged_by       uuid references auth.users(id);

-- Remove the result enum so coaches can enter free-text (e.g. "+7 yds", "TD").
alter table public.plays drop constraint if exists plays_result_check;

-- Expand play_type to cover special-teams play categories.
alter table public.plays drop constraint if exists plays_play_type_check;
alter table public.plays add constraint plays_play_type_check
  check (play_type in (
    'run', 'pass', 'rpo', 'screen', 'trick', 'qb_run', 'penalty',
    'special_teams', 'punt', 'fg', 'kick', 'special', 'other'
  ));

-- Re-index on timestamp for the play-tagging view sort order.
create index if not exists idx_plays_timestamp on public.plays(timestamp_start);
