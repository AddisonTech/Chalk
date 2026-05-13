// Integration test: verify scheme profiles, measurables, and evaluations are wired up correctly.
// Run with: node scripts/test-scheme-profiles.mjs

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
let passed = 0;
let failed = 0;

function ok(label) { console.log(`  PASS  ${label}`); passed++; }
function fail(label, reason) { console.error(`  FAIL  ${label}: ${reason}`); failed++; }

// ---- Test: scheme_profiles table has 4 demo profiles ----
console.log("\n[scheme_profiles]");
{
  const { data, error } = await admin.from("scheme_profiles").select("id, name, position, scheme_tag").eq("team_id", DEMO_TEAM);
  if (error) { fail("fetch profiles", error.message); }
  else if (data.length !== 4) { fail("profile count", `expected 4, got ${data.length}`); }
  else {
    ok(`4 profiles found`);
    for (const p of data) ok(`  ${p.name} (${p.position} / ${p.scheme_tag})`);
  }
}

// ---- Test: scheme_profile_measurables has rows for each profile ----
console.log("\n[scheme_profile_measurables]");
{
  const { data: profiles } = await admin.from("scheme_profiles").select("id, name").eq("team_id", DEMO_TEAM);
  for (const p of profiles ?? []) {
    const { data, error } = await admin.from("scheme_profile_measurables").select("id").eq("profile_id", p.id);
    if (error) fail(`measurables for ${p.name}`, error.message);
    else if (!data || data.length === 0) fail(`measurables for ${p.name}`, "no rows");
    else ok(`${p.name}: ${data.length} measurable configs`);
  }
}

// ---- Test: recruit_scheme_evaluations has 4 rows with non-zero scores ----
console.log("\n[recruit_scheme_evaluations]");
{
  const { data, error } = await admin
    .from("recruit_scheme_evaluations")
    .select("recruit_id, calculated_score, is_primary, scheme_profiles(name)")
    .order("calculated_score", { ascending: false });

  if (error) { fail("fetch evaluations", error.message); }
  else if (!data || data.length < 4) { fail("evaluation count", `expected >= 4, got ${data?.length ?? 0}`); }
  else {
    ok(`${data.length} evaluation rows`);
    for (const e of data) {
      if (e.calculated_score == null || e.calculated_score === 0) {
        fail(`score for ${e.scheme_profiles?.name}`, `score=${e.calculated_score}`);
      } else {
        ok(`${e.scheme_profiles?.name}: score=${e.calculated_score} primary=${e.is_primary}`);
      }
    }
  }
}

// ---- Test: recruits.calculated_scheme_fit is populated ----
console.log("\n[recruits.calculated_scheme_fit]");
{
  const { data, error } = await admin
    .from("recruits")
    .select("name, calculated_scheme_fit, scheme_fit_score")
    .eq("team_id", DEMO_TEAM)
    .order("name");

  if (error) { fail("fetch recruits", error.message); }
  else {
    for (const r of data ?? []) {
      if (r.calculated_scheme_fit == null) {
        fail(`${r.name} calculated_scheme_fit`, "null");
      } else {
        ok(`${r.name}: manual=${r.scheme_fit_score} calculated=${r.calculated_scheme_fit}`);
      }
    }
  }
}

// ---- Test: custom_measurables table is accessible ----
console.log("\n[custom_measurables]");
{
  const { error } = await admin.from("custom_measurables").select("id").eq("team_id", DEMO_TEAM).limit(1);
  if (error) fail("access custom_measurables", error.message);
  else ok("custom_measurables table accessible");
}

// ---- Test: recruit_custom_measurable_values table is accessible ----
console.log("\n[recruit_custom_measurable_values]");
{
  const { error } = await admin.from("recruit_custom_measurable_values").select("id").limit(1);
  if (error) fail("access recruit_custom_measurable_values", error.message);
  else ok("recruit_custom_measurable_values table accessible");
}

// ---- Summary ----
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exitCode = 1;
