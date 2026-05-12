import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { getGame, getPlays } from "@/app/actions/film-room";
import { GameDetailClient } from "@/components/film-room/game-detail-client";

interface Props {
  params: Promise<{ gameId: string }>;
}

export default async function GameDetail({ params }: Props) {
  const { gameId } = await params;
  const [game, plays] = await Promise.all([getGame(gameId), getPlays(gameId)]);
  if (!game) notFound();

  const oppsRaw = game.opponents as unknown as { name: string } | { name: string }[] | null;
  const opp = (Array.isArray(oppsRaw) ? oppsRaw[0]?.name : oppsRaw?.name) ?? "Unknown";
  const weekLabel = game.week ? `Week ${game.week}` : game.season.toString();
  const title = `${opp} - ${weekLabel}`;
  const sub = `${game.season} · ${game.is_home ? "Home" : "Away"}`;

  return (
    <>
      <Header
        title={title}
        description={sub}
        actions={
          <Link
            href="/film-room"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All games
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-10">
          <GameDetailClient gameId={gameId} opponentName={opp} plays={plays} />
        </div>
      </div>
    </>
  );
}
