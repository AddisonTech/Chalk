"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  computeSchemeScore,
  parseHeightToInches,
  STANDARD_MEASURABLE_KEYS,
  type MeasurableConfig,
  type Importance,
} from "@/lib/scoring";

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

export async function computeAndSaveEvaluation(
  recruitId: string,
  profileId: string,
  isPrimary = false,
) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found." };

  const [{ data: recruit }, { data: profileMeasurables }, { data: customValues }] =
    await Promise.all([
      supabase
        .from("recruits")
        .select("*")
        .eq("id", recruitId)
        .eq("team_id", teamId)
        .maybeSingle(),
      supabase
        .from("scheme_profile_measurables")
        .select(
          "measurable_key, custom_measurable_id, importance, target_value, range_min, range_max, custom_measurables(id, name)",
        )
        .eq("profile_id", profileId),
      supabase
        .from("recruit_custom_measurable_values")
        .select("custom_measurable_id, value_numeric")
        .eq("recruit_id", recruitId),
    ]);

  if (!recruit) return { error: "Recruit not found." };
  if (!profileMeasurables) return { error: "Profile not found." };

  const customValueMap = new Map<string, number | null>(
    (customValues ?? []).map((v) => [v.custom_measurable_id, v.value_numeric]),
  );

  type ProfMeas = {
    measurable_key: string | null;
    custom_measurable_id: string | null;
    importance: string;
    target_value: number | null;
    range_min: number | null;
    range_max: number | null;
    custom_measurables: { id: string; name: string } | null;
  };
  const configs: MeasurableConfig[] = (profileMeasurables as unknown as ProfMeas[]).map((m) => ({
    key: m.measurable_key ?? m.custom_measurable_id ?? "",
    label: m.measurable_key
      ? m.measurable_key
      : (m.custom_measurables?.name ?? "Custom"),
    importance: m.importance as Importance,
    target: m.target_value,
    rangeMin: m.range_min,
    rangeMax: m.range_max,
    isCustom: !m.measurable_key,
  }));

  function getRecruitValue(key: string): number | null {
    if ((STANDARD_MEASURABLE_KEYS as readonly string[]).includes(key)) {
      if (key === "height") return parseHeightToInches(recruit!.height);
      const val = (recruit as Record<string, unknown>)[key];
      return typeof val === "number" ? val : null;
    }
    const cv = customValueMap.get(key);
    return cv !== undefined ? cv : null;
  }

  const result = computeSchemeScore(configs, getRecruitValue);
  const calculatedScore = parseFloat(result.score.toFixed(2));

  const { error: upsertError } = await supabase
    .from("recruit_scheme_evaluations")
    .upsert(
      {
        recruit_id: recruitId,
        scheme_profile_id: profileId,
        calculated_score: calculatedScore,
        last_calculated_at: new Date().toISOString(),
        is_primary: isPrimary,
      },
      { onConflict: "recruit_id,scheme_profile_id" },
    );

  if (upsertError) return { error: upsertError.message };

  if (isPrimary) {
    await supabase
      .from("recruit_scheme_evaluations")
      .update({ is_primary: false })
      .eq("recruit_id", recruitId)
      .neq("scheme_profile_id", profileId);

    await supabase
      .from("recruits")
      .update({ calculated_scheme_fit: calculatedScore })
      .eq("id", recruitId)
      .eq("team_id", teamId);
  }

  revalidatePath("/board");
  revalidatePath(`/board/${recruitId}`);
  return { score: calculatedScore, breakdown: result.breakdown, missingCriticalCount: result.missingCriticalCount };
}

export async function getRecruitEvaluations(recruitId: string) {
  const { supabase } = await getTeamId();

  const { data } = await supabase
    .from("recruit_scheme_evaluations")
    .select(
      "id, calculated_score, last_calculated_at, is_primary, scheme_profile_id, scheme_profiles(name, position, scheme_tag)",
    )
    .eq("recruit_id", recruitId)
    .order("is_primary", { ascending: false })
    .order("calculated_score", { ascending: false });

  return data ?? [];
}

export async function setPrimaryEvaluation(recruitId: string, profileId: string) {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found." };

  await supabase
    .from("recruit_scheme_evaluations")
    .update({ is_primary: false })
    .eq("recruit_id", recruitId);

  const { error } = await supabase
    .from("recruit_scheme_evaluations")
    .update({ is_primary: true })
    .eq("recruit_id", recruitId)
    .eq("scheme_profile_id", profileId);

  if (error) return { error: error.message };

  const { data: eval_ } = await supabase
    .from("recruit_scheme_evaluations")
    .select("calculated_score")
    .eq("recruit_id", recruitId)
    .eq("scheme_profile_id", profileId)
    .maybeSingle();

  if (eval_?.calculated_score != null) {
    await supabase
      .from("recruits")
      .update({ calculated_scheme_fit: eval_.calculated_score })
      .eq("id", recruitId)
      .eq("team_id", teamId);
  }

  revalidatePath("/board");
  revalidatePath(`/board/${recruitId}`);
  return { ok: true };
}
