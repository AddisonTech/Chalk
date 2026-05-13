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

export async function getCustomMeasurables() {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return [];

  const { data } = await supabase
    .from("custom_measurables")
    .select("id, name, unit, type")
    .eq("team_id", teamId)
    .order("name");

  return data ?? [];
}

export async function createCustomMeasurable(formData: FormData) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found." };

  const name = (formData.get("name") as string)?.trim();
  const unit = (formData.get("unit") as string)?.trim() || null;
  const type = (formData.get("type") as string)?.trim() || "numeric";

  if (!name) return { error: "Name is required." };

  const { data, error } = await supabase
    .from("custom_measurables")
    .insert({ team_id: teamId, name, unit, type })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Failed to create measurable." };

  revalidatePath("/board");
  return { measurableId: data.id };
}

export async function deleteCustomMeasurable(id: string) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found." };

  const { error } = await supabase
    .from("custom_measurables")
    .delete()
    .eq("id", id)
    .eq("team_id", teamId);

  if (error) return { error: error.message };

  revalidatePath("/board");
  return { ok: true };
}

export async function getRecruitCustomValues(recruitId: string) {
  const { supabase } = await getTeamId();

  const { data } = await supabase
    .from("recruit_custom_measurable_values")
    .select("custom_measurable_id, value_numeric")
    .eq("recruit_id", recruitId);

  return data ?? [];
}

export async function upsertRecruitCustomValues(
  recruitId: string,
  values: Array<{ custom_measurable_id: string; value_numeric: number | null }>,
) {
  const { supabase } = await getTeamId();

  if (values.length === 0) return { ok: true };

  const rows = values.map((v) => ({
    recruit_id: recruitId,
    custom_measurable_id: v.custom_measurable_id,
    value_numeric: v.value_numeric,
  }));

  const { error } = await supabase
    .from("recruit_custom_measurable_values")
    .upsert(rows, { onConflict: "recruit_id,custom_measurable_id" });

  if (error) return { error: error.message };

  return { ok: true };
}
