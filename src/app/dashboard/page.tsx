import { Film, ClipboardList, BookOpen } from "lucide-react";
import { Header } from "@/components/layout/header";
import { ModuleCard } from "@/components/dashboard/module-card";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("team_id, full_name")
    .eq("id", user!.id)
    .maybeSingle();

  const teamId = profile?.team_id;

  const counts = teamId
    ? await loadCounts(supabase, teamId)
    : { games: 0, plays: 0, opponents: 0, recruits: 0, reports: 0 };

  return (
    <>
      <Header
        title={`Welcome${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}.`}
        description="Three modules. One shared brain."
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-10">
          <div className="mb-8 flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-muted">
              Modules
            </span>
            <h2 className="text-2xl font-semibold tracking-tight">
              Where would you like to work?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ModuleCard
              href="/film-room"
              title="Film Room"
              description="Break down opponent and self-scout film. Tendency reports, situational splits, personnel usage."
              icon={Film}
              stats={[
                { label: "Games", value: counts.games },
                { label: "Plays", value: counts.plays },
                { label: "Opponents", value: counts.opponents },
              ]}
              accent
            />
            <ModuleCard
              href="/board"
              title="Board"
              description="Evaluate recruits against your scheme. Scheme-fit scoring, position boards, player comps."
              icon={ClipboardList}
              stats={[
                { label: "Recruits", value: counts.recruits },
                { label: "Take", value: 0 },
                { label: "Watch", value: 0 },
              ]}
            />
            <ModuleCard
              href="/playbook"
              title="Playbook"
              description="Weekly prep output. Game plan recommendations, practice priorities, situational call sheets."
              icon={BookOpen}
              stats={[
                { label: "Reports", value: counts.reports },
                { label: "Plans", value: 0 },
                { label: "This Wk", value: 0 },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}

async function loadCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teamId: string,
) {
  const [games, plays, opponents, recruits, reports] = await Promise.all([
    supabase.from("games").select("*", { count: "exact", head: true }).eq("team_id", teamId),
    supabase.from("plays").select("*", { count: "exact", head: true }).eq("team_id", teamId),
    supabase.from("opponents").select("*", { count: "exact", head: true }).eq("team_id", teamId),
    supabase.from("recruits").select("*", { count: "exact", head: true }).eq("team_id", teamId),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("team_id", teamId),
  ]);
  return {
    games: games.count ?? 0,
    plays: plays.count ?? 0,
    opponents: opponents.count ?? 0,
    recruits: recruits.count ?? 0,
    reports: reports.count ?? 0,
  };
}
