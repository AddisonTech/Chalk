"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { upsertRecruitCustomValues } from "@/app/actions/custom-measurables";

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

  const height = (formData.get("height") as string)?.trim() || null;
  const weight = formData.get("weight") ? parseInt(formData.get("weight") as string, 10) : null;
  const fortyYard = formData.get("forty_yard") ? parseFloat(formData.get("forty_yard") as string) : null;
  const vertical = formData.get("vertical") ? parseFloat(formData.get("vertical") as string) : null;
  const benchReps = formData.get("bench_reps") ? parseInt(formData.get("bench_reps") as string, 10) : null;
  const priority = formData.get("priority") ? parseInt(formData.get("priority") as string, 10) : null;

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
      height,
      weight,
      forty_yard: fortyYard,
      vertical,
      bench_reps: benchReps,
      priority,
    })
    .select("id")
    .single();

  if (error || !recruit) return { error: error?.message ?? "Failed to add recruit" };

  const customValues: Array<{ custom_measurable_id: string; value_numeric: number | null }> = [];
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("custom_")) {
      const id = key.slice("custom_".length);
      const num = val !== "" ? parseFloat(val as string) : null;
      if (num != null && !isNaN(num)) {
        customValues.push({ custom_measurable_id: id, value_numeric: num });
      }
    }
  }
  if (customValues.length > 0) {
    await upsertRecruitCustomValues(recruit.id, customValues);
  }

  revalidatePath("/board");
  return { recruitId: recruit.id };
}

export async function getRecruits(sortBy: "name" | "tier" | "scheme_fit_score" | "position" = "name") {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return [];

  const { data } = await supabase
    .from("recruits")
    .select("id, name, position, class_year, high_school, state, tier, scheme_fit_score, calculated_scheme_fit, offer_status, height, weight, forty_yard, vertical, bench_reps, priority")
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
