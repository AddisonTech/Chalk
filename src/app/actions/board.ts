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

export async function createRecruit(formData: FormData) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found. Complete your profile first." };

  const name = (formData.get("name") as string).trim();
  const position = (formData.get("position") as string).trim();
  const classYear = formData.get("class_year") ? parseInt(formData.get("class_year") as string, 10) : null;
  const highSchool = (formData.get("high_school") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim() || null;
  const tier = (formData.get("tier") as string) || "watch";
  const schemeFit = formData.get("scheme_fit_score") ? parseFloat(formData.get("scheme_fit_score") as string) : null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  const { data: recruit, error } = await supabase
    .from("recruits")
    .insert({
      team_id: teamId,
      name,
      position,
      class_year: classYear,
      high_school: highSchool,
      city,
      state,
      tier,
      scheme_fit_score: schemeFit,
      notes,
    })
    .select("id")
    .single();

  if (error || !recruit) return { error: error?.message ?? "Failed to add recruit" };

  revalidatePath("/board");
  return { recruitId: recruit.id };
}

export async function getRecruits(sortBy: "name" | "tier" | "scheme_fit_score" | "position" = "name") {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return [];

  const { data } = await supabase
    .from("recruits")
    .select("id, name, position, class_year, high_school, state, tier, scheme_fit_score, offer_status")
    .eq("team_id", teamId)
    .order(sortBy === "scheme_fit_score" ? "scheme_fit_score" : sortBy, {
      ascending: sortBy !== "scheme_fit_score",
    });

  return data ?? [];
}

export async function getRecruit(recruitId: string) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return null;

  const { data } = await supabase
    .from("recruits")
    .select("*")
    .eq("id", recruitId)
    .eq("team_id", teamId)
    .maybeSingle();

  return data;
}
