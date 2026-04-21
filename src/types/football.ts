export const LEVELS = [
  "high_school",
  "juco",
  "naia",
  "d3",
  "d2",
  "fcs",
  "fbs",
  "nfl",
] as const;
export type Level = (typeof LEVELS)[number];

export const COACH_ROLES = [
  "head_coach",
  "coordinator",
  "position_coach",
  "analyst",
  "recruiting",
  "admin",
] as const;
export type CoachRole = (typeof COACH_ROLES)[number];

export const PLAY_TYPES = [
  "run",
  "pass",
  "rpo",
  "screen",
  "trick",
  "qb_run",
  "penalty",
  "special_teams",
] as const;
export type PlayType = (typeof PLAY_TYPES)[number];

export const FIELD_ZONES = [
  "backed_up",
  "own_territory",
  "midfield",
  "opponent_territory",
  "red_zone",
  "goal_line",
] as const;
export type FieldZone = (typeof FIELD_ZONES)[number];

export const RECRUIT_TIERS = ["take", "developmental", "watch", "pass"] as const;
export type RecruitTier = (typeof RECRUIT_TIERS)[number];

export const OFFER_STATUS = [
  "not_offered",
  "offered",
  "committed",
  "signed",
  "decommitted",
] as const;
export type OfferStatus = (typeof OFFER_STATUS)[number];

export const REPORT_TYPES = [
  "opponent_tendency",
  "self_scout",
  "game_plan",
  "recruit_eval",
  "weekly_summary",
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  high_school: "High School",
  juco: "JUCO",
  naia: "NAIA",
  d3: "NCAA DIII",
  d2: "NCAA DII",
  fcs: "NCAA FCS",
  fbs: "NCAA FBS",
  nfl: "NFL",
};

export const ROLE_LABELS: Record<CoachRole, string> = {
  head_coach: "Head Coach",
  coordinator: "Coordinator",
  position_coach: "Position Coach",
  analyst: "Analyst",
  recruiting: "Recruiting",
  admin: "Admin",
};
