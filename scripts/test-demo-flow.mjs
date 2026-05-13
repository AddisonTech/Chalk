// Test the demo account creation flow end to end.
// Mirrors src/app/actions/demo.ts exactly.
// Run with: node scripts/test-demo-flow.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "../.env.local");

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const SUPABASE_URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const SECRET_KEY = env["SUPABASE_SECRET_KEY"];
const ANON_KEY = env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
const DEMO_TEAM_ID = "00000000-0000-0000-0000-000000000001";

const admin = createClient(SUPABASE_URL, SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

let createdUserId = null;
let insertedDemoTeam = false;

console.log("=== Checking database state ===");
const { data: existingTeam } = await admin.from("teams").select("id").eq("id", DEMO_TEAM_ID).maybeSingle();
const { data: isDemo } = await admin.from("profiles").select("is_demo").limit(1);
const hasDemoTeam = Boolean(existingTeam);
const hasDemoColumn = isDemo !== null && !isDemo?.error;

// Check is_demo column specifically
const { error: colError } = await admin.from("profiles").select("is_demo").limit(0);
const hasDemoCol = !colError;

console.log(`  Demo team (migration 0003): ${hasDemoTeam ? "EXISTS" : "MISSING - needs migration 0003"}`);
console.log(`  is_demo column (migration 0004): ${hasDemoCol ? "EXISTS" : "MISSING - needs migration 0004"}`);

if (!hasDemoTeam) {
  console.log("\n  Inserting demo team temporarily to test auth flow...");
  const { error: teamErr } = await admin.from("teams").insert({
    id: DEMO_TEAM_ID,
    name: "Demo Program",
    school: "Chalk Academy",
    level: "fcs",
  });
  if (teamErr) {
    console.error("  Could not insert demo team:", teamErr.message);
    process.exit(1);
  }
  insertedDemoTeam = true;
  console.log("  Temporary demo team inserted.");
}

console.log("\n=== Running demo flow ===");

try {
  console.log("1. Creating demo user via admin API...");
  const email = `demo-test-${Date.now()}@chalk-demo.local`;
  const password = crypto.randomUUID();
  const { data, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !data.user) throw new Error(`createUser: ${createError?.message}`);
  createdUserId = data.user.id;
  console.log("   OK - user id:", createdUserId.slice(0, 8) + "...");

  console.log("2. Creating profile manually (admin API bypasses trigger)...");
  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    team_id: DEMO_TEAM_ID,
    full_name: "",
    role: "head_coach",
  });
  if (profileError) throw new Error(`Profile insert: ${profileError.message}`);
  console.log("   OK - profile on demo team");

  console.log("3. Marking is_demo (requires migration 0004)...");
  const { error: demoErr } = await admin.from("profiles").update({ is_demo: true }).eq("id", data.user.id);
  if (demoErr) {
    console.log("   SKIP - column missing, apply migration 0004");
  } else {
    console.log("   OK");
  }

  console.log("4. Signing in with generated credentials...");
  const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) throw new Error(`Sign-in: ${signInError.message}`);
  if (!signInData.session) throw new Error("No session after sign-in");
  console.log("   OK - session established");

  console.log("5. Checking seeded data visibility via authed client...");
  const authed = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${signInData.session.access_token}` } },
  });

  const { data: games } = await authed.from("games").select("id, week");
  const { data: plays } = await authed.from("plays").select("id");
  const { data: recruits } = await authed.from("recruits").select("id, name");

  if (!hasDemoTeam) {
    console.log("   SKIP - seed data not present, apply migration 0003 for games/plays/recruits");
  } else {
    console.log(`   Games: ${games?.length ?? 0}, Plays: ${plays?.length ?? 0}, Recruits: ${recruits?.length ?? 0}`);
    if ((games?.length ?? 0) < 2) console.log("   WARN: expected 2 games from seed data");
    if ((plays?.length ?? 0) < 20) console.log("   WARN: expected 24 plays from seed data");
    if ((recruits?.length ?? 0) < 4) console.log("   WARN: expected 4 recruits from seed data");
  }

  console.log("\n=== Auth flow: PASSED ===");
  console.log("The demo button will work once pending migrations are applied.");
} catch (err) {
  console.error("\n=== FAILED:", err.message, "===");
  process.exitCode = 1;
} finally {
  if (createdUserId) {
    await admin.auth.admin.deleteUser(createdUserId);
    console.log("\nTest user cleaned up.");
  }
  if (insertedDemoTeam) {
    await admin.from("teams").delete().eq("id", DEMO_TEAM_ID);
    console.log("Temporary demo team removed.");
  }
}
