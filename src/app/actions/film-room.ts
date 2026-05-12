"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getTeamId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, teamId: profile?.team_id as string | null };
}

export async function createGame(formData: FormData) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found. Complete your profile first." };

  const opponentName = (formData.get("opponent_name") as string).trim();
  const season = parseInt(formData.get("season") as string, 10);
  const week = formData.get("week") ? parseInt(formData.get("week") as string, 10) : null;
  const gameDate = (formData.get("game_date") as string) || null;
  const isHome = formData.get("is_home") === "true";
  const gameType = (formData.get("game_type") as string) || "regular";

  // Find or create opponent
  let opponentId: string;
  const { data: existing } = await supabase
    .from("opponents")
    .select("id")
    .eq("team_id", teamId)
    .ilike("name", opponentName)
    .maybeSingle();

  if (existing) {
    opponentId = existing.id;
  } else {
    const { data: newOpp, error: oppError } = await supabase
      .from("opponents")
      .insert({ team_id: teamId, name: opponentName })
      .select("id")
      .single();
    if (oppError || !newOpp) return { error: oppError?.message ?? "Failed to create opponent" };
    opponentId = newOpp.id;
  }

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({
      team_id: teamId,
      opponent_id: opponentId,
      season,
      week,
      game_date: gameDate,
      is_home: isHome,
      game_type: gameType,
    })
    .select("id")
    .single();

  if (gameError || !game) return { error: gameError?.message ?? "Failed to create game" };

  revalidatePath("/film-room");
  return { gameId: game.id };
}

export async function getGames() {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return [];

  const { data } = await supabase
    .from("games")
    .select("id, season, week, game_date, is_home, game_type, result, score_us, score_them, opponents(name)")
    .eq("team_id", teamId)
    .order("season", { ascending: false })
    .order("week", { ascending: false });

  return data ?? [];
}

export async function getGame(gameId: string) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return null;

  const { data } = await supabase
    .from("games")
    .select("id, season, week, game_date, is_home, game_type, result, score_us, score_them, notes, opponents(name)")
    .eq("id", gameId)
    .eq("team_id", teamId)
    .maybeSingle();

  return data;
}
