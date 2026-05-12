import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { getGamePlan } from "@/app/actions/playbook";
import { CONCEPTS } from "@/lib/playbook-concepts";

interface Props {
  params: Promise<{ planId: string }>;
}

const SITUATION_ORDER = [
  { key: "opening", label: "Opening script" },
  { key: "3rd_down", label: "3rd down" },
  { key: "red_zone", label: "Red zone" },
  { key: "two_minute", label: "Two-minute drill" },
  { key: "pressure", label: "Pressure package" },
  { key: "base", label: "Base defense" },
];

function ConceptCard({ name, description, phase }: { name: string; description: string; phase: string }) {
  const phaseColor = phase === "offense"
    ? "border-accent/30 bg-accent/5"
    : phase === "defense"
      ? "border-primary/30 bg-primary/5"
      : "border-border bg-surface";

  return (
    <div className={`rounded-sm border p-4 ${phaseColor}`}>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="rounded-sm bg-surface px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          {phase}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export default async function GamePlanDetail({ params }: Props) {
  const { planId } = await params;
  const plan = await getGamePlan(planId);
  if (!plan) notFound();

  const content = plan.content as {
    opponent?: string;
    week?: number;
    season?: number;
    game_type?: string;
    focus?: string;
  };

  const sub = [
    content.season,
    content.week ? `Week ${content.week}` : null,
    content.game_type === "playoff" ? "Playoff" : null,
  ].filter(Boolean).join(" · ");

  // Build the plan: pick 2 concepts per situation, alternating offense/defense
  const planSections = SITUATION_ORDER.map(({ key, label }) => {
    const all = CONCEPTS.filter((c) => c.situation === key);
    // Take up to 2, preferring one offense and one defense when both are available
    const offense = all.filter((c) => c.phase === "offense").slice(0, 1);
    const defense = all.filter((c) => c.phase === "defense").slice(0, 1);
    const selected = [...offense, ...defense].slice(0, 2);
    if (selected.length === 0) return null;
    return { label, concepts: selected };
  }).filter(Boolean) as { label: string; concepts: typeof CONCEPTS }[];

  return (
    <>
      <Header
        title={plan.title}
        description={sub}
        actions={
          <Link
            href="/playbook"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All plans
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-8 py-10">
          <div className="flex flex-col gap-6">

            {content.focus && (
              <div className="rounded-sm border border-border bg-surface p-4 text-sm text-foreground">
                <span className="mr-2 text-xs uppercase tracking-wider text-muted-foreground">Focus:</span>
                {content.focus}
              </div>
            )}

            <div className="rounded-sm border border-border bg-surface p-4 text-xs text-muted-foreground">
              Recommendations are generated from your scheme profile and a curated concept library. Review against your own scouting before finalizing.
            </div>

            {planSections.map(({ label, concepts }) => (
              <div key={label}>
                <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
                <div className="grid grid-cols-2 gap-3">
                  {concepts.map((c) => (
                    <ConceptCard key={c.id} name={c.name} description={c.description} phase={c.phase} />
                  ))}
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </>
  );
}
