"use server";

import { redirect } from "next/navigation";
import Groq from "groq-sdk";
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

export async function generateScoutingReport(
  gameId: string,
): Promise<{ report?: string; error?: string }> {
  const { supabase, teamId } = await getTeamId();
  if (!teamId) return { error: "No team found." };

  const [gameResult, playsResult] = await Promise.all([
    supabase
      .from("games")
      .select("season, week, game_date, is_home, opponents(name)")
      .eq("id", gameId)
      .eq("team_id", teamId)
      .maybeSingle(),
    supabase
      .from("plays")
      .select("down, distance, yard_line, formation, personnel, motion, concept, play_type, result, notes")
      .eq("game_id", gameId)
      .eq("team_id", teamId)
      .order("timestamp_start", { ascending: true }),
  ]);

  const game = gameResult.data;
  const plays = playsResult.data ?? [];

  if (!game) return { error: "Game not found." };

  const typed = plays.filter((p) => p.play_type === "run" || p.play_type === "pass");
  if (typed.length < 5) {
    return { error: `Not enough tagged plays to generate a report. Tag at least 5 plays with a play type (currently ${typed.length}).` };
  }

  const oppsRaw = game.opponents as unknown as { name: string } | { name: string }[] | null;
  const opponentName = (Array.isArray(oppsRaw) ? oppsRaw[0]?.name : oppsRaw?.name) ?? "Unknown";

  // Aggregate play data
  const runs = typed.filter((p) => p.play_type === "run").length;
  const passes = typed.filter((p) => p.play_type === "pass").length;
  const total = runs + passes;

  function pct(n: number, d: number) { return d > 0 ? Math.round((n / d) * 100) : 0; }

  const byDown = [1, 2, 3, 4].map((down) => {
    const dp = typed.filter((p) => p.down === down);
    const dr = dp.filter((p) => p.play_type === "run").length;
    return { down, plays: dp.length, runPct: pct(dr, dp.length) };
  }).filter((d) => d.plays > 0);

  const formCount: Record<string, number> = {};
  const persCount: Record<string, number> = {};
  const conceptCount: Record<string, number> = {};
  const motionCount: Record<string, number> = {};

  for (const p of typed) {
    if (p.formation) formCount[p.formation] = (formCount[p.formation] ?? 0) + 1;
    if (p.personnel) persCount[p.personnel] = (persCount[p.personnel] ?? 0) + 1;
    if (p.concept) conceptCount[p.concept] = (conceptCount[p.concept] ?? 0) + 1;
    if (p.motion && p.motion.toLowerCase() !== "none" && p.motion.toLowerCase() !== "no") {
      motionCount[p.motion] = (motionCount[p.motion] ?? 0) + 1;
    }
  }

  const top = <T extends string>(map: Record<T, number>, n: number) =>
    Object.entries(map)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, n)
      .map(([name, count]) => `${name} (${pct(count as number, typed.length)}%)`);

  const rz = typed.filter((p) => p.yard_line !== null && p.yard_line <= 20);
  const rzRun = rz.filter((p) => p.play_type === "run").length;

  const t3s = typed.filter((p) => p.down === 3 && (p.distance ?? 99) <= 3);
  const t3l = typed.filter((p) => p.down === 3 && (p.distance ?? 0) >= 7);
  const t3sRun = t3s.filter((p) => p.play_type === "run").length;
  const t3lRun = t3l.filter((p) => p.play_type === "run").length;

  const motionTotal = Object.values(motionCount).reduce((a, b) => a + b, 0);

  const coachNotes = plays
    .filter((p) => p.notes && p.notes.trim())
    .map((p) => p.notes)
    .slice(0, 12);

  const summary = [
    `Opponent: ${opponentName}`,
    `Total tagged plays: ${typed.length}`,
    `Overall: ${runs} runs (${pct(runs, total)}%), ${passes} passes (${pct(passes, total)}%)`,
    byDown.length > 0 ? `By down: ${byDown.map((d) => `${d.down}st/nd/rd/th (${d.plays} plays, ${d.runPct}% run)`).join("; ")}` : null,
    top(formCount, 4).length > 0 ? `Top formations: ${top(formCount, 4).join(", ")}` : null,
    top(persCount, 3).length > 0 ? `Top personnel: ${top(persCount, 3).join(", ")}` : null,
    top(conceptCount, 5).length > 0 ? `Top concepts: ${top(conceptCount, 5).join(", ")}` : null,
    rz.length > 0 ? `Red zone (${rz.length} plays): ${pct(rzRun, rz.length)}% run` : null,
    t3s.length > 0 ? `3rd and short (${t3s.length} plays): ${pct(t3sRun, t3s.length)}% run` : null,
    t3l.length > 0 ? `3rd and long (${t3l.length} plays): ${pct(t3lRun, t3l.length)}% run` : null,
    motionTotal > 0 ? `Pre-snap motion on ${pct(motionTotal, typed.length)}% of plays` : null,
    coachNotes.length > 0 ? `Coach notes: ${coachNotes.join(" | ")}` : null,
  ].filter(Boolean).join("\n");

  const prompt = `You are a football analyst helping a coaching staff prepare for a game. Based on the tagged film data below, write a scouting report for ${opponentName}.

DATA:
${summary}

Write the report in this format:
**Offensive Identity**
[2-3 sentences on their overall offensive tendencies and identity]

**Run Game**
[What they run, when they run it, preferred formations/personnel for runs]

**Pass Game**
[Pass concepts, formations, down-and-distance tendencies]

**Third Down**
[Short and long yardage tendencies if data available]

**Red Zone**
[Red zone tendencies if data available, or note if insufficient data]

**Key Adjustments**
- [Specific defensive recommendation 1]
- [Specific defensive recommendation 2]
- [Specific defensive recommendation 3]
- [Specific defensive recommendation 4]

Keep it tight. Coach-friendly language. Base everything on the data - if a category has fewer than 3 plays, note the limited sample rather than drawing conclusions.`;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "GROQ_API_KEY not set." };

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0.4,
    });
    return { report: completion.choices[0].message.content ?? "" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return { error: `Report generation failed: ${msg}` };
  }
}
