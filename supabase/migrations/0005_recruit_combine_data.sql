-- Add bench reps tracking to recruits.
-- All other combine fields (height, weight, forty_yard, vertical, shuttle,
-- broad_jump) and evaluation fields (priority, offer_status, player_comp,
-- film_grade, athleticism_grade, technique_grade, football_iq_grade,
-- strengths, weaknesses, development_notes) already exist from migration 0001.

alter table public.recruits
  add column if not exists bench_reps integer;
