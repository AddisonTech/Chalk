-- Expand scheme_profiles for position-specific weighted scoring.
-- Applied manually via Supabase dashboard.

-- Drop one-per-team constraint so a team can have multiple profiles
ALTER TABLE public.scheme_profiles DROP CONSTRAINT IF EXISTS scheme_profiles_team_id_key;

-- Identifying columns for a named position+scheme profile
ALTER TABLE public.scheme_profiles
  ADD COLUMN IF NOT EXISTS name       text,
  ADD COLUMN IF NOT EXISTS position   text,
  ADD COLUMN IF NOT EXISTS scheme_tag text;

-- Custom measurables each team can define
CREATE TABLE IF NOT EXISTS public.custom_measurables (
  id         uuid        DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id    uuid        REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name       text        NOT NULL,
  unit       text,
  type       text        DEFAULT 'numeric',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.custom_measurables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team custom measurables" ON public.custom_measurables FOR ALL
  USING  (team_id = (SELECT team_id FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (team_id = (SELECT team_id FROM public.profiles WHERE id = auth.uid()));
CREATE INDEX IF NOT EXISTS idx_custom_measurables_team ON public.custom_measurables(team_id);

-- Per-recruit values for custom measurables
CREATE TABLE IF NOT EXISTS public.recruit_custom_measurable_values (
  id                   uuid    DEFAULT uuid_generate_v4() PRIMARY KEY,
  recruit_id           uuid    REFERENCES public.recruits(id)           ON DELETE CASCADE NOT NULL,
  custom_measurable_id uuid    REFERENCES public.custom_measurables(id) ON DELETE CASCADE NOT NULL,
  value_numeric        numeric,
  created_at           timestamptz DEFAULT now(),
  UNIQUE (recruit_id, custom_measurable_id)
);
ALTER TABLE public.recruit_custom_measurable_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team recruit custom values" ON public.recruit_custom_measurable_values FOR ALL
  USING  (recruit_id IN (SELECT id FROM public.recruits WHERE team_id = (SELECT team_id FROM public.profiles WHERE id = auth.uid())))
  WITH CHECK (recruit_id IN (SELECT id FROM public.recruits WHERE team_id = (SELECT team_id FROM public.profiles WHERE id = auth.uid())));
CREATE INDEX IF NOT EXISTS idx_rcmv_recruit    ON public.recruit_custom_measurable_values(recruit_id);
CREATE INDEX IF NOT EXISTS idx_rcmv_measurable ON public.recruit_custom_measurable_values(custom_measurable_id);

-- Per-measurable config inside a scheme profile
CREATE TABLE IF NOT EXISTS public.scheme_profile_measurables (
  id                   uuid    DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id           uuid    REFERENCES public.scheme_profiles(id)    ON DELETE CASCADE NOT NULL,
  measurable_key       text,
  custom_measurable_id uuid    REFERENCES public.custom_measurables(id) ON DELETE CASCADE,
  importance           text    DEFAULT 'nice_to_have'
                               CHECK (importance IN ('critical','nice_to_have','ignore')),
  target_value         numeric,
  range_min            numeric,
  range_max            numeric,
  created_at           timestamptz DEFAULT now(),
  CONSTRAINT measurable_key_or_custom CHECK (
    measurable_key IS NOT NULL OR custom_measurable_id IS NOT NULL
  )
);
ALTER TABLE public.scheme_profile_measurables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team scheme measurables" ON public.scheme_profile_measurables FOR ALL
  USING  (profile_id IN (SELECT id FROM public.scheme_profiles WHERE team_id = (SELECT team_id FROM public.profiles WHERE id = auth.uid())))
  WITH CHECK (profile_id IN (SELECT id FROM public.scheme_profiles WHERE team_id = (SELECT team_id FROM public.profiles WHERE id = auth.uid())));
CREATE INDEX IF NOT EXISTS idx_spm_profile ON public.scheme_profile_measurables(profile_id);

-- Calculated fit scores: one row per recruit+profile pair
CREATE TABLE IF NOT EXISTS public.recruit_scheme_evaluations (
  id                  uuid    DEFAULT uuid_generate_v4() PRIMARY KEY,
  recruit_id          uuid    REFERENCES public.recruits(id)          ON DELETE CASCADE NOT NULL,
  scheme_profile_id   uuid    REFERENCES public.scheme_profiles(id)   ON DELETE CASCADE NOT NULL,
  calculated_score    numeric(5,2),
  last_calculated_at  timestamptz DEFAULT now(),
  is_primary          boolean DEFAULT false,
  UNIQUE (recruit_id, scheme_profile_id)
);
ALTER TABLE public.recruit_scheme_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team scheme evaluations" ON public.recruit_scheme_evaluations FOR ALL
  USING  (recruit_id IN (SELECT id FROM public.recruits WHERE team_id = (SELECT team_id FROM public.profiles WHERE id = auth.uid())))
  WITH CHECK (recruit_id IN (SELECT id FROM public.recruits WHERE team_id = (SELECT team_id FROM public.profiles WHERE id = auth.uid())));
CREATE INDEX IF NOT EXISTS idx_rse_recruit ON public.recruit_scheme_evaluations(recruit_id);
CREATE INDEX IF NOT EXISTS idx_rse_profile  ON public.recruit_scheme_evaluations(scheme_profile_id);

-- Denormalized quick-access score on the recruit row
ALTER TABLE public.recruits
  ADD COLUMN IF NOT EXISTS calculated_scheme_fit numeric(5,2);
