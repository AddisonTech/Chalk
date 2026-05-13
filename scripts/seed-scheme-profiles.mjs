// Seed 4 scheme profiles for the demo team and compute evaluations.
// Run with: node scripts/seed-scheme-profiles.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(join(__dir, "../.env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_TEAM = "00000000-0000-0000-0000-000000000001";

// ---- Scoring helpers (mirror of src/lib/scoring.ts) ----

function parseHeightToInches(h) {
  if (!h) return null;
  const m = h.match(/(\d+)'?\s*(\d+)?[""]?/);
  if (!m) return null;
  return parseInt(m[1], 10) * 12 + (m[2] ? parseInt(m[2], 10) : 0);
}

function scoreOneMeasurable(value, target, rangeMin, rangeMax) {
  const halfWidth = (() => {
    if (rangeMin != null && rangeMax != null) return (rangeMax - rangeMin) / 2;
    if (rangeMin != null) return Math.abs(target - rangeMin);
    if (rangeMax != null) return Math.abs(rangeMax - target);
    return Math.abs(target) * 0.2 || 10;
  })();
  if (halfWidth <= 0) return value === target ? 100 : 0;
  return Math.max(0, 100 - 50 * (Math.abs(value - target) / halfWidth));
}

function computeScore(configs, recruit) {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const c of configs) {
    const key = c.measurable_key ?? c.key;
    if (c.importance === "ignore" || c.target_value == null) continue;
    const weight = c.importance === "critical" ? 2 : 1;
    const value = key === "height" ? parseHeightToInches(recruit.height) : recruit[key];
    if (value == null) continue;
    weightedSum += scoreOneMeasurable(value, c.target_value, c.range_min ?? null, c.range_max ?? null) * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
}

// ---- Profile definitions ----

const profiles = [
  {
    name: "Cover 3 CB",
    position: "CB",
    scheme_tag: "Cover 3",
    measurables: [
      { measurable_key: "height",            importance: "critical",     target_value: 71, range_min: 69, range_max: 73 },
      { measurable_key: "weight",            importance: "nice_to_have", target_value: 190, range_min: 175, range_max: 205 },
      { measurable_key: "forty_yard",        importance: "critical",     target_value: 4.45, range_min: 4.30, range_max: 4.60 },
      { measurable_key: "vertical",          importance: "nice_to_have", target_value: 36, range_min: 30, range_max: 42 },
      { measurable_key: "shuttle",           importance: "nice_to_have", target_value: 4.15, range_min: 4.00, range_max: 4.30 },
      { measurable_key: "broad_jump",        importance: "nice_to_have", target_value: 122, range_min: 110, range_max: 132 },
      { measurable_key: "film_grade",        importance: "critical",     target_value: 7.5, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "technique_grade",   importance: "critical",     target_value: 7.0, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "athleticism_grade", importance: "nice_to_have", target_value: 7.0, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "football_iq_grade", importance: "nice_to_have", target_value: 6.5, range_min: 5.0, range_max: 10.0 },
    ],
    recruit: "DeShawn Carter",
  },
  {
    name: "Spread Slot WR",
    position: "WR",
    scheme_tag: "Spread",
    measurables: [
      { measurable_key: "height",            importance: "nice_to_have", target_value: 72, range_min: 69, range_max: 75 },
      { measurable_key: "weight",            importance: "nice_to_have", target_value: 190, range_min: 175, range_max: 210 },
      { measurable_key: "forty_yard",        importance: "critical",     target_value: 4.45, range_min: 4.30, range_max: 4.60 },
      { measurable_key: "vertical",          importance: "critical",     target_value: 38, range_min: 30, range_max: 46 },
      { measurable_key: "shuttle",           importance: "nice_to_have", target_value: 4.20, range_min: 4.05, range_max: 4.35 },
      { measurable_key: "broad_jump",        importance: "nice_to_have", target_value: 126, range_min: 114, range_max: 138 },
      { measurable_key: "film_grade",        importance: "critical",     target_value: 7.5, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "athleticism_grade", importance: "critical",     target_value: 8.0, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "technique_grade",   importance: "nice_to_have", target_value: 7.0, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "football_iq_grade", importance: "nice_to_have", target_value: 7.0, range_min: 5.0, range_max: 10.0 },
    ],
    recruit: "Marcus Hayes",
  },
  {
    name: "Pro-Style QB",
    position: "QB",
    scheme_tag: "Pro-Style",
    measurables: [
      { measurable_key: "height",            importance: "critical",     target_value: 75, range_min: 73, range_max: 78 },
      { measurable_key: "weight",            importance: "nice_to_have", target_value: 215, range_min: 200, range_max: 235 },
      { measurable_key: "forty_yard",        importance: "ignore",       target_value: null, range_min: null, range_max: null },
      { measurable_key: "film_grade",        importance: "critical",     target_value: 8.0, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "technique_grade",   importance: "critical",     target_value: 7.5, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "football_iq_grade", importance: "critical",     target_value: 8.5, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "athleticism_grade", importance: "nice_to_have", target_value: 7.0, range_min: 5.0, range_max: 10.0 },
    ],
    recruit: "Tyler Brooks",
  },
  {
    name: "3-4 Edge OLB",
    position: "OLB",
    scheme_tag: "3-4",
    measurables: [
      { measurable_key: "height",            importance: "critical",     target_value: 74, range_min: 72, range_max: 77 },
      { measurable_key: "weight",            importance: "critical",     target_value: 240, range_min: 225, range_max: 260 },
      { measurable_key: "forty_yard",        importance: "nice_to_have", target_value: 4.65, range_min: 4.50, range_max: 4.80 },
      { measurable_key: "vertical",          importance: "nice_to_have", target_value: 33, range_min: 27, range_max: 39 },
      { measurable_key: "bench_reps",        importance: "critical",     target_value: 22, range_min: 14, range_max: 30 },
      { measurable_key: "film_grade",        importance: "critical",     target_value: 7.0, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "athleticism_grade", importance: "critical",     target_value: 7.0, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "technique_grade",   importance: "nice_to_have", target_value: 6.5, range_min: 5.0, range_max: 10.0 },
      { measurable_key: "football_iq_grade", importance: "nice_to_have", target_value: 6.5, range_min: 5.0, range_max: 10.0 },
    ],
    recruit: "Jordan Reed",
  },
];

// ---- Fetch demo recruits ----
console.log("Fetching demo recruits...");
const { data: recruits, error: recErr } = await admin
  .from("recruits")
  .select("id, name, height, weight, forty_yard, vertical, shuttle, broad_jump, bench_reps, film_grade, athleticism_grade, technique_grade, football_iq_grade")
  .eq("team_id", DEMO_TEAM);

if (recErr || !recruits) {
  console.error("Failed to fetch recruits:", recErr?.message);
  process.exit(1);
}

const recruitByName = Object.fromEntries(recruits.map((r) => [r.name, r]));

// ---- Clean up existing profiles for demo team to avoid duplicates ----
console.log("Cleaning up existing demo scheme profiles...");
const { data: existing } = await admin
  .from("scheme_profiles")
  .select("id")
  .eq("team_id", DEMO_TEAM);

if (existing && existing.length > 0) {
  await admin
    .from("scheme_profiles")
    .delete()
    .in("id", existing.map((p) => p.id));
  console.log(`  Removed ${existing.length} existing profile(s)`);
}

// ---- Insert profiles + measurables + evaluations ----
for (const p of profiles) {
  console.log(`\nCreating profile: ${p.name}`);

  const { data: prof, error: profErr } = await admin
    .from("scheme_profiles")
    .insert({ team_id: DEMO_TEAM, name: p.name, position: p.position, scheme_tag: p.scheme_tag })
    .select("id")
    .single();

  if (profErr || !prof) {
    console.error(`  FAIL create profile: ${profErr?.message}`);
    continue;
  }
  console.log(`  Profile ID: ${prof.id}`);

  const measRows = p.measurables.map((m) => ({
    profile_id: prof.id,
    measurable_key: m.measurable_key,
    custom_measurable_id: null,
    importance: m.importance,
    target_value: m.target_value ?? null,
    range_min: m.range_min ?? null,
    range_max: m.range_max ?? null,
  }));

  const { error: measErr } = await admin
    .from("scheme_profile_measurables")
    .insert(measRows);

  if (measErr) {
    console.error(`  FAIL measurables: ${measErr.message}`);
    continue;
  }
  console.log(`  Inserted ${measRows.length} measurable configs`);

  // Compute score for assigned recruit
  const recruit = recruitByName[p.recruit];
  if (!recruit) {
    console.warn(`  WARNING: Recruit "${p.recruit}" not found, skipping evaluation`);
    continue;
  }

  const score = computeScore(p.measurables, recruit);
  console.log(`  Computed score for ${recruit.name}: ${score}`);

  const { error: evalErr } = await admin
    .from("recruit_scheme_evaluations")
    .upsert(
      {
        recruit_id: recruit.id,
        scheme_profile_id: prof.id,
        calculated_score: score,
        last_calculated_at: new Date().toISOString(),
        is_primary: true,
      },
      { onConflict: "recruit_id,scheme_profile_id" },
    );

  if (evalErr) {
    console.error(`  FAIL evaluation: ${evalErr.message}`);
    continue;
  }

  const { error: fitErr } = await admin
    .from("recruits")
    .update({ calculated_scheme_fit: score })
    .eq("id", recruit.id);

  if (fitErr) {
    console.error(`  FAIL update calculated_scheme_fit: ${fitErr.message}`);
  } else {
    console.log(`  Updated ${recruit.name}.calculated_scheme_fit = ${score}`);
  }
}

// ---- Verification ----
console.log("\n=== Verification ===");
const { data: evalRows } = await admin
  .from("recruit_scheme_evaluations")
  .select("recruit_id, calculated_score, is_primary, scheme_profiles(name)")
  .order("calculated_score", { ascending: false });

for (const e of evalRows ?? []) {
  const rec = recruits.find((r) => r.id === e.recruit_id);
  console.log(`  ${rec?.name ?? e.recruit_id} | ${e.scheme_profiles?.name} | score=${e.calculated_score} primary=${e.is_primary}`);
}

console.log("\nDone.");
