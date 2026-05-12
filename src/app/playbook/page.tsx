import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Header } from "@/components/layout/header";
import { EmptyState } from "@/components/ui/empty-state";
import { PlaybookClient } from "@/components/playbook/playbook-client";
import { getGamePlans } from "@/app/actions/playbook";

export default async function Playbook() {
  const plans = await getGamePlans();

  return (
    <>
      <Header
        title="Playbook"
        description="Weekly game plans, practice priorities, situational call sheets."
        actions={<PlaybookClient />}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-10">
          {plans.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No weekly plans yet"
              description="Create a game plan to get situational offensive and defensive concepts for your next opponent."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {plans.map((plan) => {
                const content = plan.content as { opponent?: string; week?: number; season?: number; game_type?: string };
                const sub = [
                  content.season,
                  content.week ? `Week ${content.week}` : null,
                  content.game_type === "playoff" ? "Playoff" : null,
                ].filter(Boolean).join(" · ");

                return (
                  <Link
                    key={plan.id}
                    href={`/playbook/${plan.id}`}
                    className="flex items-center justify-between rounded-sm border border-border bg-surface px-5 py-4 transition-colors hover:border-border-strong hover:bg-surface-raised"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-background">
                        <BookOpen className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{plan.title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
                      </div>
                    </div>
                    <span className="text-muted-foreground">→</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
