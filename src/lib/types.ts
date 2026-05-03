export type PlayType =
  | "run"
  | "pass"
  | "screen"
  | "rpo"
  | "qb_run"
  | "punt"
  | "fg"
  | "kick"
  | "special"
  | "other";

export type Film = {
  id: string;
  team_id: string;
  title: string;
  opponent: string | null;
  game_date: string | null;
  upload_url: string | null;
  created_at: string;
};

export type Play = {
  id: string;
  film_id: string;
  timestamp_start: number;
  timestamp_end: number | null;
  down: number | null;
  distance: number | null;
  yard_line: number | null;
  formation: string | null;
  personnel: string | null;
  motion: string | null;
  concept: string | null;
  play_type: PlayType | null;
  result: string | null;
  notes: string | null;
  tagged_by: string;
  created_at: string;
};
