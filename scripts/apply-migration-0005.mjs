// Apply migration 0005: verify bench_reps column exists, then seed full
// combine and evaluation data for the four demo recruits.
// Run with: node scripts/apply-migration-0005.mjs

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

// ---- Verify migration was applied ----
console.log("Checking migration 0005 (bench_reps column)...");
const { error: colCheck } = await admin.from("recruits").select("bench_reps").limit(0);
if (colCheck) {
  console.error("\nColumn not found. Run this SQL in the Supabase dashboard first:\n");
  console.error("  alter table public.recruits add column if not exists bench_reps integer;\n");
  process.exit(1);
}
console.log("  OK\n");

// ---- Rich seed data ----
// Values calibrated to each player's tier and scheme fit score.
// Dev/65 < Watch/71 < Take/84 < Take/88 in grades and measurables.

const updates = [
  {
    name: "DeShawn Carter",
    // CB, Dev tier, 65 scheme fit. Athleticism present, technique raw.
    height: "5'10\"",
    weight: 184,
    forty_yard: 4.61,
    vertical: 33.0,
    shuttle: 4.38,
    broad_jump: 119,
    bench_reps: 10,
    priority: 24,
    film_grade: 5.50,
    athleticism_grade: 6.00,
    technique_grade: 4.80,
    football_iq_grade: 5.20,
    offer_status: "not_offered",
    player_comp: "Nate Hairston",
    strengths: "Quick out of his breaks with solid initial burst in zone coverage. Willing tackler who does not shy away from physicality against the run. Shows ball awareness and tracks the ball well once it is in the air.",
    weaknesses: "Struggles with consistent footwork and hip rotation at the break point. Allows separation on double moves due to early commitment. Press technique needs significant refinement before he can hold up on the outside at the next level.",
    development_notes: "The athletic floor is there but the technique gap is real. Focused work on break mechanics and film study habits will determine how fast he closes the distance between his current level and a legitimate offer. Evaluate again mid-season.",
  },
  {
    name: "Jordan Reed",
    // OLB, Watch tier, 71 scheme fit. Frame and strength ahead of bend and pass rush.
    height: "6'2\"",
    weight: 231,
    forty_yard: 4.71,
    vertical: 32.0,
    shuttle: 4.52,
    broad_jump: 115,
    bench_reps: 18,
    priority: 12,
    film_grade: 6.50,
    athleticism_grade: 7.00,
    technique_grade: 5.80,
    football_iq_grade: 6.20,
    offer_status: "not_offered",
    player_comp: "Anfernee Jennings",
    strengths: "Outstanding frame for the position with the length to create problems at the line of scrimmage. Above-average lateral quickness for his size. Productive against the run with good point-of-attack strength and a high motor through four quarters.",
    weaknesses: "Bend is the question mark. Needs to develop flexibility off the edge to threaten as a speed rusher rather than relying solely on strength. Can be neutralized when offensive tackles get early hand placement on his chest.",
    development_notes: "Pass rush repertoire is thin right now -- speed to power is his only consistent move. A dedicated flexibility and technique program this offseason is the clear path to unlocking his upside. The football IQ to learn a complex scheme is there.",
  },
  {
    name: "Marcus Hayes",
    // WR, Take tier, 84 scheme fit. Elite speed, route tree catching up.
    height: "6'1\"",
    weight: 191,
    forty_yard: 4.47,
    vertical: 38.5,
    shuttle: 4.21,
    broad_jump: 128,
    bench_reps: 11,
    priority: 2,
    film_grade: 7.80,
    athleticism_grade: 8.50,
    technique_grade: 7.20,
    football_iq_grade: 7.50,
    offer_status: "offered",
    player_comp: "Rashod Bateman",
    strengths: "Elite straight-line speed that creates separation at every level of the route tree. Exceptional body control and reliable hands in traffic. Creates explosive plays after the catch with the ball in space and the vision to find daylight in zone coverage.",
    weaknesses: "Route tree still developing, particularly shorter in-breaking routes where footwork precision at the top of the stem needs work. Release package against press coverage is somewhat limited and needs more variety to hold up consistently.",
    development_notes: "Scheme fit is excellent for a spread system needing a vertical threat with YAC ability. The athletic profile is ready to contribute early. Closing the technique gap on the intermediate routes is the one thing standing between him and a day-one impact player.",
  },
  {
    name: "Tyler Brooks",
    // QB, Take tier, 88 scheme fit, 2027 class. Elite IQ, pro frame, not a scrambler.
    height: "6'4\"",
    weight: 213,
    forty_yard: 4.76,
    vertical: 31.5,
    shuttle: 4.61,
    broad_jump: 108,
    bench_reps: 9,
    priority: 3,
    film_grade: 8.20,
    athleticism_grade: 7.00,
    technique_grade: 7.80,
    football_iq_grade: 8.80,
    offer_status: "not_offered",
    player_comp: "Sam Hartman",
    strengths: "Exceptional football IQ and pre-snap recognition that consistently puts him in control of the defense before the ball is snapped. Plus arm talent with the ability to layer throws over linebackers and fit the ball into tight windows under pressure. Demonstrates strong command of the huddle and keeps the offense composed in critical situations.",
    weaknesses: "Limited as a designed running threat and needs to play in a system that protects the pocket. Decision-making under pressure can still be rushed, leading to occasional first-read forced throws when the pocket collapses unexpectedly.",
    development_notes: "Top priority recruit given the scheme fit combination of arm talent and football IQ. Processing speed and pocket presence are ahead of most 2027 prospects at this stage. High-priority official visit target for the next evaluation window. Do not let him get to signing day without an offer.",
  },
];

// ---- Apply updates ----
console.log("Seeding combine and evaluation data...");
let ok = 0;
let fail = 0;
for (const u of updates) {
  const { name, ...fields } = u;
  const { error } = await admin
    .from("recruits")
    .update(fields)
    .eq("team_id", DEMO_TEAM)
    .eq("name", name);

  if (error) {
    console.error(`  FAIL  ${name}: ${error.message}`);
    fail++;
  } else {
    console.log(`  OK    ${name}`);
    ok++;
  }
}

// ---- Verify ----
console.log(`\n=== Verification (${ok} updated, ${fail} failed) ===`);
const { data: recruits } = await admin
  .from("recruits")
  .select("name, height, weight, forty_yard, vertical, bench_reps, priority, film_grade, athleticism_grade, technique_grade, football_iq_grade, offer_status, player_comp")
  .eq("team_id", DEMO_TEAM)
  .order("name");

for (const r of recruits ?? []) {
  console.log(`\n${r.name} (${r.height}, ${r.weight}lbs, 40:${r.forty_yard}, VRT:${r.vertical}, BCH:${r.bench_reps}, #${r.priority})`);
  console.log(`  Grades  film:${r.film_grade} ath:${r.athleticism_grade} tec:${r.technique_grade} iq:${r.football_iq_grade}`);
  console.log(`  Status: ${r.offer_status}  Comp: ${r.player_comp}`);
}

if (fail > 0) process.exitCode = 1;
