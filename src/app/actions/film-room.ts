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

export async function getPlays(gameId: string) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return [];

  const { data } = await supabase
    .from("plays")
    .select("id, timestamp_start, timestamp_end, down, distance, yard_line, formation, personnel, motion, concept, play_type, result, notes")
    .eq("game_id", gameId)
    .eq("team_id", teamId)
    .order("timestamp_start", { ascending: true });

  return data ?? [];
}

export async function createPlay(formData: FormData) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found." };

  const gameId = formData.get("game_id") as string;

  const tsStart = formData.get("timestamp_start");
  const tsEnd = formData.get("timestamp_end");
  const down = formData.get("down");
  const distance = formData.get("distance");
  const yardLine = formData.get("yard_line");

  const { error } = await supabase.from("plays").insert({
    game_id: gameId,
    team_id: teamId,
    timestamp_start: tsStart ? parseInt(tsStart as string, 10) : null,
    timestamp_end: tsEnd ? parseInt(tsEnd as string, 10) : null,
    down: down ? parseInt(down as string, 10) : null,
    distance: distance ? parseInt(distance as string, 10) : null,
    yard_line: yardLine ? parseInt(yardLine as string, 10) : null,
    formation: (formData.get("formation") as string) || null,
    personnel: (formData.get("personnel") as string) || null,
    motion: (formData.get("motion") as string) || null,
    concept: (formData.get("concept") as string) || null,
    play_type: (formData.get("play_type") as string) || null,
    result: (formData.get("result") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/film-room/${gameId}`);
  return { ok: true };
}
