// Integration test: verifies production schema and end-to-end play tagging.
// Checks columns, constraints, trigger, then creates a real demo user and tags a play.
// Run with: node scripts/test-integration.mjs

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

const SUPABASE_URL  = env["NEXT_PUBLIC_SUPABASE_URL"];
const SECRET_KEY    = env["SUPABASE_SECRET_KEY"];
const ANON_KEY      = env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
const DEMO_TEAM_ID  = "00000000-0000-0000-0000-000000000001";
const DEMO_GAME_ID  = "00000000-0000-0000-0002-000000000001";

const admin = createClient(SUPABASE_URL, SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let testUserId = null;
let testPlayId  = null;
let passed = 0;
let failed = 0;

function ok(label) {
  console.log(`  [PASS] ${label}`);
  passed++;
}

function fail(label, detail) {
  console.error(`  [FAIL] ${label}${detail ? ": " + detail : ""}`);
  failed++;
}

// ---- 1. Schema: timestamp columns exist ----
console.log("\n1. Schema checks...");
{
  const { data, error } = await admin
    .from("plays")
    .select("id, timestamp_start, timestamp_end, tagged_by")
    .limit(1);

  if (error) {
    fail("plays has timestamp_start, timestamp_end, tagged_by", error.message);
  } else {
    ok("plays has timestamp_start, timestamp_end, tagged_by");
  }
}

// ---- 2. Schema: result accepts free text ----
{
  const testId = crypto.randomUUID();
  const { error } = await admin.from("plays").insert({
    id: testId,
    game_id: DEMO_GAME_ID,
    team_id: DEMO_TEAM_ID,
    down: 1,
    distance: 10,
    result: "+99 yds some free text",
  });

  if (error) {
    fail("result column accepts free text", error.message);
  } else {
    ok("result column accepts free text");
    // clean up immediately
    await admin.from("plays").delete().eq("id", testId);
  }
}

// ---- 3. Schema: expanded play_type values work ----
{
  const testId = crypto.randomUUID();
  const { error } = await admin.from("plays").insert({
    id: testId,
    game_id: DEMO_GAME_ID,
    team_id: DEMO_TEAM_ID,
    play_type: "punt",
  });

  if (error) {
    fail("play_type accepts 'punt' (expanded constraint)", error.message);
  } else {
    ok("play_type accepts 'punt' (expanded constraint)");
    await admin.from("plays").delete().eq("id", testId);
  }
}

// ---- 4. Schema: is_demo column on profiles ----
{
  const { error } = await admin.from("profiles").select("is_demo").limit(1);
  if (error) {
    fail("profiles has is_demo column", error.message);
  } else {
    ok("profiles has is_demo column");
  }
}

// ---- 5. Trigger: new auth user auto-creates profile on demo team ----
console.log("\n2. Trigger check (handle_new_user)...");
{
  const email    = `trigger-test-${Date.now()}@chalk-demo.local`;
  const password = crypto.randomUUID();

  const { data, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr || !data?.user) {
    fail("create auth user", createErr?.message);
  } else {
    testUserId = data.user.id;
    // Give trigger a moment
    await new Promise((r) => setTimeout(r, 800));

    const { data: profile, error: profErr } = await admin
      .from("profiles")
      .select("id, team_id, role")
      .eq("id", testUserId)
      .maybeSingle();

    if (profErr || !profile) {
      fail("trigger created profile automatically", profErr?.message ?? "no row found");
    } else if (profile.team_id !== DEMO_TEAM_ID) {
      fail("profile joined demo team", `team_id = ${profile.team_id}`);
    } else {
      ok(`trigger created profile on demo team (role: ${profile.role})`);
    }
  }
}

// ---- 6. End-to-end: sign in and tag a play ----
console.log("\n3. End-to-end play tagging...");
if (testUserId) {
  const email    = `e2e-test-${Date.now()}@chalk-demo.local`;
  const password = crypto.randomUUID();

  // Create a fresh user for the sign-in test (separate from trigger test user).
  // Trigger fires automatically and creates the profile on the demo team.
  const { data: userData, error: createErr2 } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createErr2 || !userData?.user) {
    fail("create e2e test user", createErr2?.message);
  } else {
    const e2eUserId = userData.user.id;

    // Wait for trigger to commit the profile row.
    await new Promise((r) => setTimeout(r, 800));

    // Verify trigger created the profile with the correct team before we sign in.
    const { data: e2eProfile } = await admin
      .from("profiles")
      .select("team_id")
      .eq("id", e2eUserId)
      .maybeSingle();

    if (!e2eProfile || e2eProfile.team_id !== DEMO_TEAM_ID) {
      fail("e2e user profile on demo team (trigger)", `team_id = ${e2eProfile?.team_id ?? "missing"}`);
    } else {
      ok("e2e user profile on demo team (trigger)");

      const anonClient = createClient(SUPABASE_URL, ANON_KEY);
      const { data: session, error: signInErr } = await anonClient.auth.signInWithPassword({ email, password });

      if (signInErr || !session?.session) {
        fail("sign in as demo user", signInErr?.message ?? "no session");
      } else {
        ok("signed in as demo user");

        const authed = createClient(SUPABASE_URL, ANON_KEY, {
          global: { headers: { Authorization: `Bearer ${session.session.access_token}` } },
        });

        const { data: playData, error: playErr } = await authed
          .from("plays")
          .insert({
            game_id: DEMO_GAME_ID,
            team_id: DEMO_TEAM_ID,
            timestamp_start: 500,
            timestamp_end: 507,
            down: 3,
            distance: 7,
            yard_line: 42,
            formation: "Shotgun",
            personnel: "11",
            motion: null,
            concept: "Spacing",
            play_type: "pass",
            result: "+9 yds 1st",
            notes: "Integration test play",
          })
          .select("id, timestamp_start, timestamp_end, result")
          .single();

        if (playErr || !playData) {
          fail("insert play with timestamps and free-text result", playErr?.message);
        } else {
          testPlayId = playData.id;
          ok(`play inserted (id: ${playData.id.slice(0, 8)}...)`);

          if (playData.timestamp_start === 500 && playData.timestamp_end === 507) {
            ok("timestamp_start and timestamp_end round-trip correctly");
          } else {
            fail("timestamp round-trip", `got start=${playData.timestamp_start} end=${playData.timestamp_end}`);
          }

          if (playData.result === "+9 yds 1st") {
            ok("free-text result stored correctly");
          } else {
            fail("free-text result", `got "${playData.result}"`);
          }

          const { data: plays, error: readErr } = await authed
            .from("plays")
            .select("id, timestamp_start, timestamp_end, down, distance, yard_line, formation, personnel, motion, concept, play_type, result, notes")
            .eq("game_id", DEMO_GAME_ID)
            .eq("team_id", DEMO_TEAM_ID)
            .order("timestamp_start", { ascending: true });

          if (readErr) {
            fail("getPlays read-back", readErr.message);
          } else {
            ok(`getPlays returns ${plays.length} plays (including test play)`);
          }
        }
      }
    }

    // Clean up e2e user
    if (testPlayId) {
      await admin.from("plays").delete().eq("id", testPlayId);
    }
    await admin.auth.admin.deleteUser(e2eUserId);
  }
}

// ---- Cleanup trigger test user ----
if (testUserId) {
  await admin.auth.admin.deleteUser(testUserId);
}

// ---- Summary ----
console.log(`\n${"=".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log("All checks passed. Production schema and play tagging are good.");
} else {
  console.log("Some checks failed. Review output above before pushing.");
  process.exitCode = 1;
}
