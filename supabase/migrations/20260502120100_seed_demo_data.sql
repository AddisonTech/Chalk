-- Demo seed data for first-time setup.
-- Auto-adds every new auth user to a shared "Demo Team" with a coach role,
-- so a fresh sign-up sees realistic data on the Film Room screen.

-- Fixed UUIDs for the demo records so the trigger and seeds line up.
-- demo team:    00000000-0000-0000-0000-000000000001
-- demo film 1:  10000000-0000-0000-0000-000000000001
-- demo film 2:  10000000-0000-0000-0000-000000000002

-- Pick a system user to own the demo records: the first existing auth user, if any.
-- Without one, the seed is skipped and the trigger handles new sign-ups.

do $$
declare
  sys_user uuid;
begin
  select id into sys_user from auth.users order by created_at asc limit 1;

  if sys_user is null then
    return;
  end if;

  -- Team
  insert into public.teams (id, name, created_by)
  values ('00000000-0000-0000-0000-000000000001', 'Demo Team', sys_user)
  on conflict (id) do nothing;

  -- Membership for the system user
  insert into public.team_members (team_id, user_id, role)
  values ('00000000-0000-0000-0000-000000000001', sys_user, 'owner')
  on conflict do nothing;

  -- Films
  insert into public.films (id, team_id, title, opponent, game_date, upload_url) values
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Week 1: vs. East High',  'East High', '2025-08-30', null),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Week 2: at North Catholic', 'North Catholic', '2025-09-06', null)
  on conflict (id) do nothing;

  -- Plays (a small representative slice)
  insert into public.plays
    (film_id, timestamp_start, timestamp_end, down, distance, yard_line, formation, personnel, motion, concept, play_type, result, notes, tagged_by)
  values
    ('10000000-0000-0000-0000-000000000001',  12,  18, 1, 10, 25, 'Trips Right', '11', null,        'Inside Zone',     'run',  '+4 yds',       'TE seal worked',                       sys_user),
    ('10000000-0000-0000-0000-000000000001',  45,  52, 2,  6, 29, 'Trips Right', '11', 'Z-jet',     'Stick',           'pass', '+8 yds, 1st',  'Slot won the rep',                    sys_user),
    ('10000000-0000-0000-0000-000000000001',  92, 100, 1, 10, 37, 'Doubles',     '11', null,        'Mesh',            'pass', 'incomplete',    'CB squeezed shallow',                  sys_user),
    ('10000000-0000-0000-0000-000000000001', 130, 137, 2, 10, 37, 'Doubles',     '11', 'F-arc',     'Smash',           'pass', '+12 yds, 1st', 'Corner over the top of the safety',    sys_user),
    ('10000000-0000-0000-0000-000000000001', 175, 181, 1, 10, 49, 'Empty',       '10', null,        'Levels',          'pass', '+5 yds',       'Hot off pressure look',                 sys_user),
    ('10000000-0000-0000-0000-000000000001', 220, 227, 3,  3, 46, 'Tight I',     '21', null,        'Power',           'run',  '+6 yds, 1st',  'Pulling guard kicked DE',               sys_user),
    ('10000000-0000-0000-0000-000000000002',  10,  17, 1, 10, 35, 'Trips Right', '11', null,        'Outside Zone',    'run',  '+2 yds',       'OLB set the edge',                      sys_user),
    ('10000000-0000-0000-0000-000000000002',  44,  50, 2,  8, 37, 'Doubles',     '11', null,        'Four Verts',      'pass', '+22 yds',      'Hash safety late on bender',            sys_user),
    ('10000000-0000-0000-0000-000000000002',  88,  94, 1, 10, 41, 'Bunch Right', '11', 'F-shift',   'Spacing',         'pass', '+7 yds',       'Easy completion underneath',            sys_user),
    ('10000000-0000-0000-0000-000000000002', 140, 147, 2,  3, 48, 'I-form',      '21', null,        'Power Read',      'rpo',  '+5 yds, 1st',  'QB kept on box read',                   sys_user)
  on conflict do nothing;

  -- Prospects
  insert into public.prospects (team_id, name, position, school, grad_year, height, weight, gpa, notes, created_by) values
    ('00000000-0000-0000-0000-000000000001', 'Marcus Hayes', 'WR', 'Lincoln HS',     2026, '6''1"', 185, 3.6, 'Long speed, solid hands. Needs route polish.', sys_user),
    ('00000000-0000-0000-0000-000000000001', 'Jordan Reed',  'OLB', 'Westview HS',   2026, '6''2"', 215, 3.2, 'Edge bender. Bend > strength.',                  sys_user),
    ('00000000-0000-0000-0000-000000000001', 'Tyler Brooks', 'QB', 'Madison Prep',   2027, '6''3"', 200, 3.8, 'Big arm, decision-making improving.',            sys_user)
  on conflict do nothing;
end $$;

-- Trigger: when a new auth.users row is inserted, add them to the demo team
-- and (if it doesn't yet exist) seed the demo records under the new user.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_team boolean;
begin
  select exists(select 1 from public.teams where id = '00000000-0000-0000-0000-000000000001') into has_team;

  if not has_team then
    -- Seed the demo team owned by this user, plus a couple of films and plays.
    insert into public.teams (id, name, created_by)
    values ('00000000-0000-0000-0000-000000000001', 'Demo Team', new.id);

    insert into public.films (id, team_id, title, opponent, game_date) values
      ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Week 1: vs. East High',     'East High',     '2025-08-30'),
      ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Week 2: at North Catholic', 'North Catholic', '2025-09-06');

    insert into public.plays
      (film_id, timestamp_start, timestamp_end, down, distance, yard_line, formation, personnel, motion, concept, play_type, result, notes, tagged_by)
    values
      ('10000000-0000-0000-0000-000000000001',  12,  18, 1, 10, 25, 'Trips Right', '11', null,        'Inside Zone',     'run',  '+4 yds',       'TE seal worked',                       new.id),
      ('10000000-0000-0000-0000-000000000001',  45,  52, 2,  6, 29, 'Trips Right', '11', 'Z-jet',     'Stick',           'pass', '+8 yds, 1st',  'Slot won the rep',                    new.id),
      ('10000000-0000-0000-0000-000000000001',  92, 100, 1, 10, 37, 'Doubles',     '11', null,        'Mesh',            'pass', 'incomplete',    'CB squeezed shallow',                  new.id),
      ('10000000-0000-0000-0000-000000000001', 130, 137, 2, 10, 37, 'Doubles',     '11', 'F-arc',     'Smash',           'pass', '+12 yds, 1st', 'Corner over the top of the safety',    new.id),
      ('10000000-0000-0000-0000-000000000001', 175, 181, 1, 10, 49, 'Empty',       '10', null,        'Levels',          'pass', '+5 yds',       'Hot off pressure look',                 new.id),
      ('10000000-0000-0000-0000-000000000001', 220, 227, 3,  3, 46, 'Tight I',     '21', null,        'Power',           'run',  '+6 yds, 1st',  'Pulling guard kicked DE',               new.id),
      ('10000000-0000-0000-0000-000000000002',  10,  17, 1, 10, 35, 'Trips Right', '11', null,        'Outside Zone',    'run',  '+2 yds',       'OLB set the edge',                      new.id),
      ('10000000-0000-0000-0000-000000000002',  44,  50, 2,  8, 37, 'Doubles',     '11', null,        'Four Verts',      'pass', '+22 yds',      'Hash safety late on bender',            new.id),
      ('10000000-0000-0000-0000-000000000002',  88,  94, 1, 10, 41, 'Bunch Right', '11', 'F-shift',   'Spacing',         'pass', '+7 yds',       'Easy completion underneath',            new.id),
      ('10000000-0000-0000-0000-000000000002', 140, 147, 2,  3, 48, 'I-form',      '21', null,        'Power Read',      'rpo',  '+5 yds, 1st',  'QB kept on box read',                   new.id);

    insert into public.prospects (team_id, name, position, school, grad_year, height, weight, gpa, notes, created_by) values
      ('00000000-0000-0000-0000-000000000001', 'Marcus Hayes', 'WR', 'Lincoln HS',     2026, '6''1"', 185, 3.6, 'Long speed, solid hands. Needs route polish.', new.id),
      ('00000000-0000-0000-0000-000000000001', 'Jordan Reed',  'OLB', 'Westview HS',   2026, '6''2"', 215, 3.2, 'Edge bender. Bend > strength.',                  new.id),
      ('00000000-0000-0000-0000-000000000001', 'Tyler Brooks', 'QB', 'Madison Prep',   2027, '6''3"', 200, 3.8, 'Big arm, decision-making improving.',            new.id);
  end if;

  -- Always make the new user a coach on the demo team.
  insert into public.team_members (team_id, user_id, role)
  values ('00000000-0000-0000-0000-000000000001', new.id, 'coach')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
