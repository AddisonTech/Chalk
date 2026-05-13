"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Star } from "lucide-react";
import { setPrimaryEvaluation } from "@/app/actions/evaluations";
import type { MeasurableBreakdownRow } from "@/lib/scoring";

export interface EvalWithBreakdown {
  id: string;
  calculated_score: number | null;
  last_calculated_at: string | null;
  is_primary: boolean;
  scheme_profile_id: string;
  profile_name: string | null;
  profile_position: string | null;
  profile_scheme_tag: string | null;
  breakdown: MeasurableBreakdownRow[];
  missingCriticalCount: number;
}

interface Props {
  recruitId: string;
  evals: EvalWithBreakdown[];
}

function scoreColor(score: number | null): string {
  if (score == null) return "text-muted-foreground";
  if (score >= 75) return "text-success";
  if (score >= 50) return "text-foreground";
  return "text-muted-foreground";
}

function BreakdownTable({ breakdown }: { breakdown: MeasurableBreakdownRow[] }) {
  const rows = breakdown.filter((b) => b.importance !== "ignore");
  if (!rows.length) return null;
  return (
    <div className="mt-3 overflow-hidden rounded-sm border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-surface">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Measurable</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Importance</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Value</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Target</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {rows.map((b) => (
            <tr key={b.key}>
              <td className="px-3 py-2 text-foreground">{b.label}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-medium ${
                  b.importance === "critical"
                    ? "bg-accent/10 text-accent"
                    : "bg-surface-raised text-muted-foreground"
                }`}>
                  {b.importance === "critical" ? "Critical" : "Nice to have"}
                </span>
              </td>
              <td className="px-3 py-2 text-right font-mono text-foreground">
                {b.recruitValue != null ? b.recruitValue : (
                  <span className={b.missingCritical ? "text-amber-500" : "text-muted-foreground"}>-</span>
                )}
              </td>
              <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                {b.target != null ? b.target : "-"}
              </td>
              <td className="px-3 py-2 text-right font-mono">
                {b.score != null ? (
                  <span className={scoreColor(b.score)}>{b.score.toFixed(0)}</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AllEvaluationsSection({ recruitId, evals }: Props) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSetPrimary(profileId: string) {
    setSettingPrimary(profileId);
    startTransition(async () => {
      await setPrimaryEvaluation(recruitId, profileId);
      router.refresh();
      setSettingPrimary(null);
    });
  }

  return (
    <div className="rounded-sm border border-border bg-surface p-5">
      <div className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        All Scheme Evaluations
      </div>

      {evals.length <= 1 ? (
        <p className="text-xs text-muted-foreground">
          This recruit has only been evaluated against one scheme profile. Open the Scheme Profiles panel from the Board to assign additional profiles.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border overflow-hidden rounded-sm border border-border">
          {evals.map((e) => {
            const isExpanded = expanded.has(e.id);
            const isBusy = pending && settingPrimary === e.scheme_profile_id;
            return (
              <div key={e.id} className="px-3 py-3">
                <div className="flex items-center gap-3">
                  {/* Expand toggle */}
                  <button
                    onClick={() => toggleExpand(e.id)}
                    className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    title={isExpanded ? "Collapse breakdown" : "View breakdown"}
                  >
                    {isExpanded
                      ? <ChevronDown className="h-3.5 w-3.5" />
                      : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>

                  {/* Profile name + tags */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {e.profile_name ?? "Unknown profile"}
                      </span>
                      {e.is_primary && (
                        <span className="flex items-center gap-0.5 text-[10px] text-accent">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      {e.profile_position && <span>{e.profile_position}</span>}
                      {e.profile_position && e.profile_scheme_tag && <span>·</span>}
                      {e.profile_scheme_tag && <span>{e.profile_scheme_tag}</span>}
                    </div>
                  </div>

                  {/* Score */}
                  <span className={`font-mono text-base font-semibold tabular-nums ${scoreColor(e.calculated_score)}`}>
                    {e.calculated_score ?? "-"}
                  </span>

                  {/* Set primary */}
                  {!e.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(e.scheme_profile_id)}
                      disabled={pending}
                      className="rounded-sm border border-border px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground disabled:opacity-40"
                    >
                      {isBusy ? "Saving..." : "Set primary"}
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-1 pl-6">
                    {e.missingCriticalCount > 0 && (
                      <p className="mt-2 text-[11px] text-amber-500">
                        {e.missingCriticalCount} critical measurable{e.missingCriticalCount > 1 ? "s" : ""} missing data
                      </p>
                    )}
                    <BreakdownTable breakdown={e.breakdown} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
