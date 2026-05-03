import { Film as FilmIcon } from "lucide-react";
import { ModuleHeader } from "@/components/ModuleHeader";
import { createClient } from "@/lib/supabase/server";
import { FilmRoom } from "@/components/film-room/FilmRoom";
import type { Film, Play } from "@/lib/types";

type Props = {
  searchParams: Promise<{ film?: string }>;
};

export default async function FilmRoomPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { film: filmFromQuery } = await searchParams;

  const { data: filmsData } = await supabase
    .from("films")
    .select("id, team_id, title, opponent, game_date, upload_url, created_at")
    .order("game_date", { ascending: false, nullsFirst: false });

  const films: Film[] = (filmsData ?? []) as Film[];
  const selectedId = filmFromQuery ?? films[0]?.id ?? null;

  let plays: Play[] = [];
  if (selectedId) {
    const { data: playsData } = await supabase
      .from("plays")
      .select(
        "id, film_id, timestamp_start, timestamp_end, down, distance, yard_line, formation, personnel, motion, concept, play_type, result, notes, tagged_by, created_at"
      )
      .eq("film_id", selectedId)
      .order("timestamp_start", { ascending: true });
    plays = (playsData ?? []) as Play[];
  }

  return (
    <div className="flex h-full flex-col">
      <ModuleHeader
        icon={FilmIcon}
        label="Film Room"
        title="Film breakdown and tendency analysis"
        description="Pick a film on the left, see every tagged play on the right. Tag a new play to add to the cut-up."
      />
      <div className="flex-1 overflow-hidden">
        <FilmRoom films={films} selectedFilmId={selectedId} plays={plays} />
      </div>
    </div>
  );
}
