import { Film, Plus, MapPin } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { EmptyState } from "@/components/ui/empty-state";
import { FilmRoomClient } from "@/components/film-room/film-room-client";
import { getGames } from "@/app/actions/film-room";

export default async function FilmRoom() {
  const games = await getGames();

  return (
    <>
      <Header
        title="Film Room"
        description="Opponent breakdown, self-scout, and tendency reports."
        actions={<FilmRoomClient />}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-10">
          {games.length === 0 ? (
            <EmptyState
              icon={Film}
              title="No games charted yet"
              description="Add your first game to start generating tendency reports and situational breakdowns."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {games.map((game) => {
                const oppsRaw = game.opponents as unknown as { name: string } | { name: string }[] | null;
                const opp = (Array.isArray(oppsRaw) ? oppsRaw[0]?.name : oppsRaw?.name) ?? "Unknown opponent";
                const label = game.week ? `Week ${game.week}` : `${game.season}`;
                const location = game.is_home ? "Home" : "Away";
                const typeLabel =
                  game.game_type === "regular" ? "" :
                  game.game_type === "playoff" ? " · Playoff" :
                  game.game_type === "scrimmage" ? " · Scrimmage" : " · Spring";

                return (
                  <Link
                    key={game.id}
                    href={`/film-room/${game.id}`}
                    className="flex items-center justify-between rounded-sm border border-border bg-surface px-5 py-4 transition-colors hover:border-border-strong hover:bg-surface-raised"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-background">
                        <Film className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{opp}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{game.season} · {label}{typeLabel}</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="rounded-sm bg-background px-2 py-1 font-mono text-[11px]">
                        Tendency report
                      </span>
                      <span className="text-muted">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
