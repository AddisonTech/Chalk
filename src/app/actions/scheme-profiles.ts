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

export async function getSchemeProfiles() {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return [];

  const { data } = await supabase
    .from("scheme_profiles")
    .select("id, name, position, scheme_tag, created_at")
    .eq("team_id", teamId)
    .order("position")
    .order("name");

  return data ?? [];
}

export async function createSchemeProfile(formData: FormData) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found." };

  const name = (formData.get("name") as string)?.trim();
  const position = (formData.get("position") as string)?.trim() || null;
  const schemeTag = (formData.get("scheme_tag") as string)?.trim() || null;

  if (!name) return { error: "Name is required." };

  const { data, error } = await supabase
    .from("scheme_profiles")
    .insert({ team_id: teamId, name, position, scheme_tag: schemeTag })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Failed to create profile." };

  revalidatePath("/board");
  return { profileId: data.id };
}

export async function updateSchemeProfile(
  profileId: string,
  updates: { name?: string; position?: string | null; scheme_tag?: string | null },
) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found." };

  const { error } = await supabase
    .from("scheme_profiles")
    .update(updates)
    .eq("id", profileId)
    .eq("team_id", teamId);

  if (error) return { error: error.message };

  revalidatePath("/board");
  return { ok: true };
}

export async function deleteSchemeProfile(profileId: string) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found." };

  const { error } = await supabase
    .from("scheme_profiles")
    .delete()
    .eq("id", profileId)
    .eq("team_id", teamId);

  if (error) return { error: error.message };

  revalidatePath("/board");
  return { ok: true };
}

export async function getProfileMeasurables(profileId: string) {
  const { supabase } = await getTeamId();

  const { data } = await supabase
    .from("scheme_profile_measurables")
    .select("id, measurable_key, custom_measurable_id, importance, target_value, range_min, range_max")
    .eq("profile_id", profileId);

  return data ?? [];
}

export async function saveProfileMeasurables(
  profileId: string,
  measurables: Array<{
    measurable_key?: string | null;
    custom_measurable_id?: string | null;
    importance: string;
    target_value?: number | null;
    range_min?: number | null;
    range_max?: number | null;
  }>,
) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found." };

  const { error: delError } = await supabase
    .from("scheme_profile_measurables")
    .delete()
    .eq("profile_id", profileId);

  if (delError) return { error: delError.message };

  if (measurables.length === 0) {
    revalidatePath("/board");
    return { ok: true };
  }

  const rows = measurables.map((m) => ({
    profile_id: profileId,
    measurable_key: m.measurable_key ?? null,
    custom_measurable_id: m.custom_measurable_id ?? null,
    importance: m.importance,
    target_value: m.target_value ?? null,
    range_min: m.range_min ?? null,
    range_max: m.range_max ?? null,
  }));

  const { error: insError } = await supabase
    .from("scheme_profile_measurables")
    .insert(rows);

  if (insError) return { error: insError.message };

  revalidatePath("/board");
  return { ok: true };
}
