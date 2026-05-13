// Applies all data rows from migration 0003 via the Supabase admin client.
// Run with: node scripts/apply-seed.mjs

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
const OPP1      = "00000000-0000-0000-0001-000000000001";
const OPP2      = "00000000-0000-0000-0001-000000000002";
const GAME1     = "00000000-0000-0000-0002-000000000001";
const GAME2     = "00000000-0000-0000-0002-000000000002";

function check(label, error) {
  if (error) throw new Error(`${label}: ${error.message}`);
}

// ---- Team ----
console.log("1. Team...");
check("team", (await admin.from("teams").upsert(
  { id: DEMO_TEAM, name: "Demo Program", school: "Chalk Academy", level: "fcs" },
  { onConflict: "id", ignoreDuplicates: true }
)).error);
console.log("   OK");

// ---- Opponents ----
console.log("2. Opponents...");
check("opponents", (await admin.from("opponents").upsert([
  { id: OPP1, team_id: DEMO_TEAM, name: "East Riverside", school: "East Riverside High School", level: "high_school" },
  { id: OPP2, team_id: DEMO_TEAM, name: "North Catholic",  school: "North Catholic High School",  level: "high_school" },
], { onConflict: "id", ignoreDuplicates: true })).error);
console.log("   OK");

// ---- Games ----
console.log("3. Games...");
check("games", (await admin.from("games").upsert([
  { id: GAME1, team_id: DEMO_TEAM, opponent_id: OPP1, season: 2025, week: 1, game_date: "2025-08-30", is_home: true,  game_type: "regular" },
  { id: GAME2, team_id: DEMO_TEAM, opponent_id: OPP2, season: 2025, week: 4, game_date: "2025-09-20", is_home: false, game_type: "regular" },
], { onConflict: "id", ignoreDuplicates: true })).error);
console.log("   OK");

// ---- Plays: Game 1 ----
const { count: p1existing } = await admin.from("plays").select("*", { count: "exact", head: true }).eq("game_id", GAME1);
if (p1existing === 0) {
  console.log("4. Plays (Game 1 vs East Riverside)...");
  check("plays-game1", (await admin.from("plays").insert([
    { game_id: GAME1, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 25, formation: "Trips Right", personnel: "11", motion: null,    concept: "Inside Zone",    play_type: "run",    result: "positive",    yards_gained: 4,  notes: "TE seal worked, crease off double team" },
    { game_id: GAME1, team_id: DEMO_TEAM, down: 2, distance: 6,  yard_line: 29, formation: "Trips Right", personnel: "11", motion: "Z-jet", concept: "Stick",          play_type: "pass",   result: "first_down",  yards_gained: 8,  notes: "Slot won on the leverage route" },
    { game_id: GAME1, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 37, formation: "Doubles",     personnel: "11", motion: null,    concept: "Mesh",           play_type: "pass",   result: "incomplete",  yards_gained: 0,  notes: "CB squeezed the shallow, good coverage" },
    { game_id: GAME1, team_id: DEMO_TEAM, down: 2, distance: 10, yard_line: 37, formation: "Doubles",     personnel: "11", motion: "F-arc", concept: "Smash",          play_type: "pass",   result: "first_down",  yards_gained: 12, notes: "Corner route over the top of the safety" },
    { game_id: GAME1, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 49, formation: "Empty",       personnel: "10", motion: null,    concept: "Levels",         play_type: "pass",   result: "positive",    yards_gained: 5,  notes: "Hot throw off pressure look" },
    { game_id: GAME1, team_id: DEMO_TEAM, down: 3, distance: 3,  yard_line: 46, formation: "Tight I",     personnel: "21", motion: null,    concept: "Power",          play_type: "run",    result: "first_down",  yards_gained: 6,  notes: "Pulling guard kicked the DE" },
    { game_id: GAME1, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 40, formation: "Trips Right", personnel: "11", motion: null,    concept: "Outside Zone",   play_type: "run",    result: "positive",    yards_gained: 2,  notes: "OLB set the edge, bounced inside" },
    { game_id: GAME1, team_id: DEMO_TEAM, down: 2, distance: 8,  yard_line: 42, formation: "Doubles",     personnel: "11", motion: null,    concept: "Four Verticals", play_type: "pass",   result: "positive",    yards_gained: 22, is_explosive: true, notes: "Hash safety was late on the bender route" },
    { game_id: GAME1, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 20, formation: "Bunch Right", personnel: "11", motion: null,    concept: "Spacing",        play_type: "pass",   result: "positive",    yards_gained: 7,  notes: "Easy completion underneath the zone" },
    { game_id: GAME1, team_id: DEMO_TEAM, down: 2, distance: 3,  yard_line: 13, formation: "I-Form",      personnel: "21", motion: null,    concept: "Power Read",     play_type: "rpo",    result: "first_down",  yards_gained: 5,  notes: "QB kept on the box count read" },
    { game_id: GAME1, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 8,  formation: "Trips Right", personnel: "11", motion: null,    concept: "Fade",           play_type: "pass",   result: "incomplete",  yards_gained: 0,  notes: "CB kept outside leverage, contested" },
    { game_id: GAME1, team_id: DEMO_TEAM, down: 2, distance: 10, yard_line: 8,  formation: "Empty",       personnel: "10", motion: null,    concept: "Hitch/Flat",     play_type: "pass",   result: "td",          yards_gained: 8,  notes: "Slot open vs. off coverage in the flat" },
  ])).error);
  console.log("   Inserted 12 plays");
} else {
  console.log(`4. Plays (Game 1): ${p1existing} rows already present, skipping`);
}

// ---- Plays: Game 2 ----
const { count: p2existing } = await admin.from("plays").select("*", { count: "exact", head: true }).eq("game_id", GAME2);
if (p2existing === 0) {
  console.log("5. Plays (Game 2 vs North Catholic)...");
  check("plays-game2", (await admin.from("plays").insert([
    { game_id: GAME2, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 35, formation: "Trips Right", personnel: "11", motion: null,       concept: "Outside Zone",   play_type: "run",    result: "positive",    yards_gained: 2,  notes: "OLB set the edge, held to short gain" },
    { game_id: GAME2, team_id: DEMO_TEAM, down: 2, distance: 8,  yard_line: 37, formation: "Doubles",     personnel: "11", motion: null,       concept: "Four Verticals", play_type: "pass",   result: "positive",    yards_gained: 22, is_explosive: true, notes: "Hash safety late on the bender route" },
    { game_id: GAME2, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 41, formation: "Bunch Right", personnel: "11", motion: "F-shift",  concept: "Spacing",        play_type: "pass",   result: "positive",    yards_gained: 7,  notes: "Easy completion underneath, YAC" },
    { game_id: GAME2, team_id: DEMO_TEAM, down: 2, distance: 3,  yard_line: 48, formation: "I-Form",      personnel: "21", motion: null,       concept: "Power Read",     play_type: "rpo",    result: "first_down",  yards_gained: 5,  notes: "QB kept on the box read" },
    { game_id: GAME2, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 30, formation: "Shotgun",     personnel: "11", motion: null,       concept: "Mesh",           play_type: "pass",   result: "positive",    yards_gained: 6,  notes: "Y-cross converted vs. zone" },
    { game_id: GAME2, team_id: DEMO_TEAM, down: 2, distance: 4,  yard_line: 36, formation: "Pistol",      personnel: "12", motion: null,       concept: "Inside Zone",    play_type: "run",    result: "first_down",  yards_gained: 4,  notes: "TE base block opened the crease" },
    { game_id: GAME2, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 20, formation: "Trips Left",  personnel: "11", motion: null,       concept: "Smash",          play_type: "pass",   result: "positive",    yards_gained: 9,  notes: "Corner route over safety coverage" },
    { game_id: GAME2, team_id: DEMO_TEAM, down: 2, distance: 1,  yard_line: 11, formation: "I-Form",      personnel: "21", motion: null,       concept: "Power",          play_type: "run",    result: "first_down",  yards_gained: 3,  notes: "Pulling guard won the point of attack" },
    { game_id: GAME2, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 8,  formation: "Empty",       personnel: "10", motion: null,       concept: "Corner",         play_type: "pass",   result: "td",          yards_gained: 8,  notes: "Corner route front pylon, off platform" },
    { game_id: GAME2, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 45, formation: "Doubles",     personnel: "11", motion: null,       concept: "Stick",          play_type: "pass",   result: "incomplete",  yards_gained: 0,  notes: "Forced into tight coverage, good D" },
    { game_id: GAME2, team_id: DEMO_TEAM, down: 2, distance: 10, yard_line: 45, formation: "Spread",      personnel: "10", motion: null,       concept: "Screen",         play_type: "screen", result: "first_down",  yards_gained: 12, notes: "WR screen on leverage, good block" },
    { game_id: GAME2, team_id: DEMO_TEAM, down: 1, distance: 10, yard_line: 33, formation: "Trips Right", personnel: "11", motion: null,       concept: "Inside Zone",    play_type: "run",    result: "positive",    yards_gained: 5,  notes: "Crease off double team, north-south" },
  ])).error);
  console.log("   Inserted 12 plays");
} else {
  console.log(`5. Plays (Game 2): ${p2existing} rows already present, skipping`);
}

// ---- Recruits ----
const { count: rexisting } = await admin.from("recruits").select("*", { count: "exact", head: true }).eq("team_id", DEMO_TEAM);
if (rexisting === 0) {
  console.log("6. Recruits...");
  check("recruits", (await admin.from("recruits").insert([
    { team_id: DEMO_TEAM, name: "Marcus Hayes",   position: "WR",  class_year: 2026, high_school: "Lincoln HS",          city: "Columbia",   state: "SC", tier: "take",         scheme_fit_score: 84, notes: "Long speed, solid hands. Route tree still developing." },
    { team_id: DEMO_TEAM, name: "Jordan Reed",    position: "OLB", class_year: 2026, high_school: "Westview HS",         city: "Greenville", state: "SC", tier: "watch",        scheme_fit_score: 71, notes: "Edge bender with upside. Bend over strength for now." },
    { team_id: DEMO_TEAM, name: "Tyler Brooks",   position: "QB",  class_year: 2027, high_school: "Madison Prep",        city: "Charlotte",  state: "NC", tier: "take",         scheme_fit_score: 88, notes: "Big arm, decision-making improving each week." },
    { team_id: DEMO_TEAM, name: "DeShawn Carter", position: "CB",  class_year: 2026, high_school: "East Riverside High", city: "Columbia",   state: "SC", tier: "developmental", scheme_fit_score: 65, notes: "Athleticism is there. Technique needs work at the break." },
  ])).error);
  console.log("   Inserted 4 recruits");
} else {
  console.log(`6. Recruits: ${rexisting} rows already present, skipping`);
}

// ---- Game plans ----
const REPORT1 = "00000000-0000-0000-0003-000000000001";
const REPORT2 = "00000000-0000-0000-0003-000000000002";
const { count: rpexisting } = await admin.from("reports").select("*", { count: "exact", head: true }).eq("team_id", DEMO_TEAM);
if (rpexisting === 0) {
  console.log("7. Game plans...");
  check("reports", (await admin.from("reports").upsert([
    {
      id: REPORT1,
      team_id: DEMO_TEAM,
      created_by: null,
      report_type: "game_plan",
      title: "Week 1 - East Riverside",
      content: {
        opponent: "East Riverside",
        week: 1,
        season: 2025,
        game_type: "regular",
        focus: "Attack their soft zone with crossing concepts. Contain the QB run game with disciplined D-gap assignments on all outside zone looks.",
      },
    },
    {
      id: REPORT2,
      team_id: DEMO_TEAM,
      created_by: null,
      report_type: "game_plan",
      title: "Week 4 - North Catholic",
      content: {
        opponent: "North Catholic",
        week: 4,
        season: 2025,
        game_type: "regular",
        focus: "Exploit their single-high tendency with four verticals. In the red zone, use trips RPO to force a declare before the snap.",
      },
    },
  ], { onConflict: "id", ignoreDuplicates: true })).error);
  console.log("   Inserted 2 game plans");
} else {
  console.log(`7. Game plans: ${rpexisting} rows already present, skipping`);
}

// ---- Final counts ----
console.log("\n=== Verification ===");
const { count: tc } = await admin.from("teams").select("*", { count: "exact", head: true });
const { count: oc } = await admin.from("opponents").select("*", { count: "exact", head: true });
const { count: gc } = await admin.from("games").select("*", { count: "exact", head: true });
const { count: pc } = await admin.from("plays").select("*", { count: "exact", head: true });
const { count: rc } = await admin.from("recruits").select("*", { count: "exact", head: true });
const { count: rpc } = await admin.from("reports").select("*", { count: "exact", head: true }).eq("team_id", DEMO_TEAM);
console.log(`teams:     ${tc}  (expected 1)`);
console.log(`opponents: ${oc}  (expected 2)`);
console.log(`games:     ${gc}  (expected 2)`);
console.log(`plays:     ${pc}  (expected 24)`);
console.log(`recruits:  ${rc}  (expected 4)`);
console.log(`reports:   ${rpc}  (expected 2)`);
