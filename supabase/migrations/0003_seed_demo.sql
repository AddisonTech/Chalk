-- Demo seed data.
-- Creates a shared Demo Program team with realistic games, plays, and recruits.
-- Every new auth signup is auto-joined to this team via the handle_new_user trigger,
-- so a fresh account sees real data on first login.
--
-- Fixed UUIDs:
--   demo team:      00000000-0000-0000-0000-000000000001
--   opponent 1:     00000000-0000-0000-0001-000000000001  (East Riverside HS)
--   opponent 2:     00000000-0000-0000-0001-000000000002  (North Catholic HS)
--   game 1 (wk 1):  00000000-0000-0000-0002-000000000001
--   game 2 (wk 4):  00000000-0000-0000-0002-000000000002

-- Team
insert into public.teams (id, name, school, level)
values ('00000000-0000-0000-0000-000000000001', 'Demo Program', 'Chalk Academy', 'fcs')
on conflict (id) do nothing;

-- Opponents
insert into public.opponents (id, team_id, name, school, level) values
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'East Riverside',  'East Riverside High School', 'high_school'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'North Catholic',  'North Catholic High School',  'high_school')
on conflict (id) do nothing;

-- Games
insert into public.games (id, team_id, opponent_id, season, week, game_date, is_home, game_type) values
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 2025, 1, '2025-08-30', true,  'regular'),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', 2025, 4, '2025-09-20', false, 'regular')
on conflict (id) do nothing;

-- Plays: Game 1 vs East Riverside (tagged_by NULL - visible to all demo team members)
do $$ begin
  if not exists (select 1 from public.plays where game_id = '00000000-0000-0000-0002-000000000001') then
    insert into public.plays
      (game_id, team_id, timestamp_start, timestamp_end, down, distance, yard_line, formation, personnel, motion, concept, play_type, result, notes)
    values
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001',  12,  18, 1, 10, 25, 'Trips Right', '11', null,    'Inside Zone',    'run',  '+4 yds',       'TE seal worked, crease off double team'),
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001',  45,  52, 2,  6, 29, 'Trips Right', '11', 'Z-jet', 'Stick',          'pass', '+8 yds 1st',   'Slot won on the leverage route'),
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001',  92, 100, 1, 10, 37, 'Doubles',     '11', null,    'Mesh',           'pass', 'incomplete',   'CB squeezed the shallow, good coverage'),
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 130, 137, 2, 10, 37, 'Doubles',     '11', 'F-arc', 'Smash',          'pass', '+12 yds 1st',  'Corner route over the top of the safety'),
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 175, 181, 1, 10, 49, 'Empty',       '10', null,    'Levels',         'pass', '+5 yds',       'Hot throw off pressure look'),
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 220, 227, 3,  3, 46, 'Tight I',     '21', null,    'Power',          'run',  '+6 yds 1st',   'Pulling guard kicked the DE'),
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 268, 274, 1, 10, 40, 'Trips Right', '11', null,    'Outside Zone',   'run',  '+2 yds',       'OLB set the edge, bounced inside'),
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 310, 318, 2,  8, 42, 'Doubles',     '11', null,    'Four Verticals', 'pass', '+22 yds',      'Hash safety was late on the bender route'),
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 355, 361, 1, 10, 20, 'Bunch Right', '11', null,    'Spacing',        'pass', '+7 yds',       'Easy completion underneath the zone'),
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 400, 407, 2,  3, 13, 'I-Form',      '21', null,    'Power Read',     'rpo',  '+5 yds 1st',   'QB kept on the box count read'),
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 445, 450, 1, 10,  8, 'Trips Right', '11', null,    'Fade',           'pass', 'incomplete',   'CB kept outside leverage, contested'),
      ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001', 488, 494, 2, 10,  8, 'Empty',       '10', null,    'Hitch/Flat',     'pass', 'TD',           'Slot open vs. off coverage in the flat');
  end if;
end $$;

-- Plays: Game 2 vs North Catholic
do $$ begin
  if not exists (select 1 from public.plays where game_id = '00000000-0000-0000-0002-000000000002') then
    insert into public.plays
      (game_id, team_id, timestamp_start, timestamp_end, down, distance, yard_line, formation, personnel, motion, concept, play_type, result, notes)
    values
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001',  10,  17, 1, 10, 35, 'Trips Right', '11', null,      'Outside Zone',   'run',  '+2 yds',       'OLB set the edge, held to short gain'),
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001',  44,  50, 2,  8, 37, 'Doubles',     '11', null,      'Four Verticals', 'pass', '+22 yds',      'Hash safety late on the bender route'),
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001',  88,  94, 1, 10, 41, 'Bunch Right', '11', 'F-shift', 'Spacing',        'pass', '+7 yds',       'Easy completion underneath, YAC'),
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 140, 147, 2,  3, 48, 'I-Form',      '21', null,      'Power Read',     'rpo',  '+5 yds 1st',   'QB kept on the box read'),
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 185, 192, 1, 10, 30, 'Shotgun',     '11', null,      'Mesh',           'pass', '+6 yds',       'Y-cross converted vs. zone'),
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 228, 234, 2,  4, 36, 'Pistol',      '12', null,      'Inside Zone',    'run',  '+4 yds 1st',   'TE base block opened the crease'),
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 270, 277, 1, 10, 20, 'Trips Left',  '11', null,      'Smash',          'pass', '+9 yds',       'Corner route over safety coverage'),
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 312, 318, 2,  1, 11, 'I-Form',      '21', null,      'Power',          'run',  '+3 yds 1st',   'Pulling guard won the point of attack'),
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 355, 361, 1, 10,  8, 'Empty',       '10', null,      'Corner',         'pass', 'TD',           'Corner route front pylon, off platform'),
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 400, 406, 1, 10, 45, 'Doubles',     '11', null,      'Stick',          'pass', 'incomplete',   'Forced into tight coverage, good D'),
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 445, 451, 2, 10, 45, 'Spread',      '10', null,      'Screen',         'screen', '+12 yds 1st','WR screen on leverage, good block'),
      ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001', 490, 496, 1, 10, 33, 'Trips Right', '11', null,      'Inside Zone',    'run',  '+5 yds',       'Crease off double team, north-south');
  end if;
end $$;

-- Recruits
do $$ begin
  if not exists (select 1 from public.recruits where team_id = '00000000-0000-0000-0000-000000000001') then
    insert into public.recruits (team_id, name, position, class_year, high_school, city, state, tier, scheme_fit_score, notes) values
      ('00000000-0000-0000-0000-000000000001', 'Marcus Hayes',   'WR',  2026, 'Lincoln HS',    'Columbia',    'SC', 'take',          84, 'Long speed, solid hands. Route tree still developing.'),
      ('00000000-0000-0000-0000-000000000001', 'Jordan Reed',    'OLB', 2026, 'Westview HS',   'Greenville',  'SC', 'watch',         71, 'Edge bender with upside. Bend over strength for now.'),
      ('00000000-0000-0000-0000-000000000001', 'Tyler Brooks',   'QB',  2027, 'Madison Prep',  'Charlotte',   'NC', 'take',          88, 'Big arm, decision-making improving each week.'),
      ('00000000-0000-0000-0000-000000000001', 'DeShawn Carter', 'CB',  2026, 'East Riverside High', 'Columbia', 'SC', 'developmental', 65, 'Athleticism is there. Technique needs work at the break.');
  end if;
end $$;

-- Auto-join trigger: every new auth user gets a profile on the demo team.
-- Reads full_name from user metadata if provided at signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, team_id, full_name, role)
  values (
    new.id,
    '00000000-0000-0000-0000-000000000001',
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'head_coach'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
