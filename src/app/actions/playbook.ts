"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");
  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id, id")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, teamId: profile?.team_id as string | null, profileId: profile?.id as string | null };
}

export async function createGamePlan(formData: FormData) {
  const { supabase, teamId, profileId } = await getContext();
  if (!teamId) return { error: "No team found. Complete your profile first." };

  const opponent = (formData.get("opponent") as string).trim();
  const week = formData.get("week") ? parseInt(formData.get("week") as string, 10) : null;
  const season = parseInt(formData.get("season") as string, 10);
  const gameType = (formData.get("game_type") as string) || "regular";
  const focus = (formData.get("focus") as string) || "";

  const title = week ? `Week ${week} - ${opponent}` : `${season} - ${opponent}`;

  const content = { opponent, week, season, game_type: gameType, focus };

  const { data: plan, error } = await supabase
    .from("reports")
    .insert({
      team_id: teamId,
      created_by: profileId,
      report_type: "game_plan",
      title,
      content,
    })
    .select("id")
    .single();

  if (error || !plan) return { error: error?.message ?? "Failed to create game plan" };

  revalidatePath("/playbook");
  return { planId: plan.id };
}

export async function getGamePlans() {
  const { supabase, teamId } = await getContext();
  if (!teamId) return [];

  const { data } = await supabase
    .from("reports")
    .select("id, title, content, created_at")
    .eq("team_id", teamId)
    .eq("report_type", "game_plan")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getGamePlan(planId: string) {
  const { supabase, teamId } = await getContext();
  if (!teamId) return null;

  const { data } = await supabase
    .from("reports")
    .select("id, title, content, created_at")
    .eq("id", planId)
    .eq("team_id", teamId)
    .eq("report_type", "game_plan")
    .maybeSingle();

  return data;
}
