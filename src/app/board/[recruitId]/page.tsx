import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { getRecruit } from "@/app/actions/board";
import { getRecruitEvaluations } from "@/app/actions/evaluations";
import { getProfileMeasurables } from "@/app/actions/scheme-profiles";
import { getRecruitCustomValues } from "@/app/actions/custom-measurables";
import {
  computeSchemeScore,
  parseHeightToInches,
  STANDARD_MEASURABLE_KEYS,
  STANDARD_MEASURABLE_LABELS,
  type MeasurableConfig,
  type Importance,
  type MeasurableBreakdownRow,
} from "@/lib/scoring";

interface Props {
  params: Promise<{ recruitId: string }>;
}

const TIER_COLORS: Record<string, string> = {
  take: "bg-success/10 text-success border border-success/25",
  developmental: "bg-primary/10 text-accent border border-primary/25",
  watch: "bg-surface-raised text-muted-foreground border border-border",
  pass: "bg-danger/10 text-danger border border-danger/25",
};

const TIER_LABELS: Record<string, string> = {
  take: "Take",
  developmental: "Developmental",
  watch: "Watch",
  pass: "Pass",
};

function GradeBar({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  const pct = Math.min(100, Math.max(0, (value / 10) * 100));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{value.toFixed(1)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string | number | null | undefined; unit?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {value != null && value !== "" ? (
        <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
          {value}{unit ?? ""}
        </span>
      ) : (
        <span className="font-mono text-xl font-semibold text-muted-foreground">-</span>
      )}
    </div>
  );
}

export default async function RecruitDetail({ params }: Props) {
  const { recruitId } = await params;
  const [r, evaluations] = await Promise.all([
    getRecruit(recruitId),
    getRecruitEvaluations(recruitId),
  ]);
  if (!r) notFound();

  const hasGrades = r.film_grade != null || r.athleticism_grade != null || r.technique_grade != null || r.football_iq_grade != null;
  const hasMeasurables = r.forty_yard != null || r.vertical != null || r.bench_reps != null || r.shuttle != null || r.broad_jump != null;
  const location = [r.city, r.state].filter(Boolean).join(", ");

  type EvalRow = {
    id: string;
    calculated_score: number | null;
    is_primary: boolean;
    scheme_profile_id: string;
    scheme_profiles: { name: string | null; position: string | null; scheme_tag: string | null } | null;
  };
  const typedEvals = evaluations as unknown as EvalRow[];
  const primaryEval = typedEvals.find((e) => e.is_primary) ?? typedEvals[0] ?? null;

  let breakdown: MeasurableBreakdownRow[] | null = null;
  let primaryProfileName: string | null = null;
  let missingCriticalCount = 0;

  if (primaryEval) {
    primaryProfileName = primaryEval.scheme_profiles?.name ?? null;
    const [profileMeasurables, customValues] = await Promise.all([
      getProfileMeasurables(primaryEval.scheme_profile_id),
      getRecruitCustomValues(recruitId),
    ]);

    type ProfMeasRow = {
      measurable_key: string | null;
      custom_measurable_id: string | null;
      importance: string;
      target_value: number | null;
      range_min: number | null;
      range_max: number | null;
    };

    const customValueMap = new Map<string, number | null>(
      (customValues as { custom_measurable_id: string; value_numeric: number | null }[])
        .map((v) => [v.custom_measurable_id, v.value_numeric])
    );

    const configs: MeasurableConfig[] = (profileMeasurables as ProfMeasRow[]).map((m) => ({
      key: m.measurable_key ?? m.custom_measurable_id ?? "",
      label: m.measurable_key
        ? STANDARD_MEASURABLE_LABELS[m.measurable_key as typeof STANDARD_MEASURABLE_KEYS[number]] ?? m.measurable_key
        : m.custom_measurable_id ?? "",
      importance: m.importance as Importance,
      target: m.target_value,
      rangeMin: m.range_min,
      rangeMax: m.range_max,
      isCustom: !m.measurable_key,
    }));

    function getRecruitValue(key: string): number | null {
      if ((STANDARD_MEASURABLE_KEYS as readonly string[]).includes(key)) {
        if (key === "height") return parseHeightToInches(r!.height);
        const val = (r as Record<string, unknown>)[key];
        return typeof val === "number" ? val : null;
      }
      const cv = customValueMap.get(key);
      return cv !== undefined ? cv : null;
    }

    const result = computeSchemeScore(configs, getRecruitValue);
    breakdown = result.breakdown;
    missingCriticalCount = result.missingCriticalCount;
  }

  return (
    <>
      <Header
        title={r.name}
        description={[r.position, r.class_year ? `Class of ${r.class_year}` : null].filter(Boolean).join(" · ")}
        actions={
          <Link
            href="/board"
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Board
          </Link>
        }
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-8 py-10">
          <div className="grid grid-cols-3 gap-5">

            {/* Main info */}
            <div className="col-span-2 flex flex-col gap-5">

              <div className="rounded-sm border border-border bg-surface p-5">
                <div className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Profile</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Position" value={r.position} />
                  <Field label="Class year" value={r.class_year} />
                  <Field label="High school" value={r.high_school} />
                  <Field label="Location" value={location || null} />
                  <Field label="Height" value={r.height} />
                  <Field label="Weight" value={r.weight ? `${r.weight} lbs` : null} />
                </div>
              </div>

              {hasMeasurables && (
                <div className="rounded-sm border border-border bg-surface p-5">
                  <div className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Testing & Measurables</div>
                  <div className="grid grid-cols-3 gap-x-6 gap-y-5 sm:grid-cols-5">
                    <Stat label="40-yd dash" value={r.forty_yard} unit="s" />
                    <Stat label="Vertical" value={r.vertical} unit='"' />
                    <Stat label="Bench reps" value={r.bench_reps} />
                    <Stat label="Shuttle" value={r.shuttle} unit="s" />
                    <Stat label="Broad jump" value={r.broad_jump} unit='"' />
                  </div>
                </div>
              )}

              {(r.strengths || r.weaknesses || r.development_notes || r.notes) && (
                <div className="rounded-sm border border-border bg-surface p-5">
                  <div className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Scout notes</div>
                  <div className="flex flex-col gap-4">
                    {r.strengths && (
                      <div>
                        <div className="mb-1 text-xs text-muted-foreground">Strengths</div>
                        <p className="text-sm leading-relaxed text-foreground">{r.strengths}</p>
                      </div>
                    )}
                    {r.weaknesses && (
                      <div>
                        <div className="mb-1 text-xs text-muted-foreground">Areas to develop</div>
                        <p className="text-sm leading-relaxed text-foreground">{r.weaknesses}</p>
                      </div>
                    )}
                    {r.development_notes && (
                      <div>
                        <div className="mb-1 text-xs text-muted-foreground">Development notes</div>
                        <p className="text-sm leading-relaxed text-foreground">{r.development_notes}</p>
                      </div>
                    )}
                    {r.notes && (
                      <div>
                        <div className="mb-1 text-xs text-muted-foreground">Notes</div>
                        <p className="text-sm leading-relaxed text-foreground">{r.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {breakdown && breakdown.filter((b) => b.importance !== "ignore").length > 0 && (
                <div className="rounded-sm border border-border bg-surface p-5">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Scheme Fit Breakdown
                    </div>
                    {primaryProfileName && (
                      <span className="text-[10px] text-muted-foreground">{primaryProfileName}</span>
                    )}
                  </div>
                  {missingCriticalCount > 0 && (
                    <p className="mb-3 mt-2 text-[11px] text-amber-500">
                      {missingCriticalCount} critical measurable{missingCriticalCount > 1 ? "s" : ""} missing data
                    </p>
                  )}
                  <div className="mt-4 overflow-hidden rounded-sm border border-border">
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
                        {breakdown
                          .filter((b) => b.importance !== "ignore")
                          .map((b) => (
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
                                  <span className={
                                    b.score >= 75 ? "text-success" :
                                    b.score >= 50 ? "text-foreground" : "text-muted-foreground"
                                  }>
                                    {b.score.toFixed(0)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {typedEvals.length > 1 && (
                <div className="rounded-sm border border-border bg-surface p-5">
                  <div className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">All Evaluations</div>
                  <div className="flex flex-col divide-y divide-border overflow-hidden rounded-sm border border-border">
                    {typedEvals.map((e) => (
                      <div key={e.id} className="flex items-center justify-between px-3 py-2.5">
                        <div>
                          <span className="text-xs text-foreground">{e.scheme_profiles?.name ?? "Unknown profile"}</span>
                          {e.is_primary && (
                            <span className="ml-2 text-[10px] text-accent">primary</span>
                          )}
                        </div>
                        <span className={`font-mono text-xs font-semibold ${
                          e.calculated_score != null && e.calculated_score >= 75 ? "text-success" :
                          e.calculated_score != null && e.calculated_score >= 50 ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {e.calculated_score ?? "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-5">

              <div className="rounded-sm border border-border bg-surface p-5">
                <div className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Evaluation</div>
                <div className="flex flex-col gap-3">
                  {r.tier && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Tier</span>
                      <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${TIER_COLORS[r.tier] ?? ""}`}>
                        {TIER_LABELS[r.tier] ?? r.tier}
                      </span>
                    </div>
                  )}
                  {r.priority != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Position rank</span>
                      <span className="font-mono text-sm font-semibold text-accent">#{r.priority}</span>
                    </div>
                  )}
                  {r.scheme_fit_score != null && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Scheme fit (manual)</span>
                        <span className={`font-mono font-semibold ${r.scheme_fit_score >= 75 ? "text-success" : r.scheme_fit_score >= 50 ? "text-foreground" : "text-muted-foreground"}`}>
                          {r.scheme_fit_score}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${r.scheme_fit_score}%` }} />
                      </div>
                    </div>
                  )}
                  {primaryEval?.calculated_score != null && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {primaryProfileName ? `${primaryProfileName}` : "Calc. scheme fit"}
                        </span>
                        <span className={`font-mono font-semibold ${primaryEval.calculated_score >= 75 ? "text-success" : primaryEval.calculated_score >= 50 ? "text-foreground" : "text-muted-foreground"}`}>
                          {primaryEval.calculated_score}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                        <div className="h-full rounded-full bg-success/70" style={{ width: `${primaryEval.calculated_score}%` }} />
                      </div>
                    </div>
                  )}
                  {r.offer_status && r.offer_status !== "not_offered" && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Status</span>
                      <span className="text-xs capitalize text-foreground">{r.offer_status.replace(/_/g, " ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {hasGrades && (
                <div className="rounded-sm border border-border bg-surface p-5">
                  <div className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Grades</div>
                  <div className="flex flex-col gap-3">
                    <GradeBar label="Film" value={r.film_grade} />
                    <GradeBar label="Athleticism" value={r.athleticism_grade} />
                    <GradeBar label="Technique" value={r.technique_grade} />
                    <GradeBar label="Football IQ" value={r.football_iq_grade} />
                  </div>
                </div>
              )}

              {r.player_comp && (
                <div className="rounded-sm border border-border bg-surface p-5">
                  <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Player comp</div>
                  <p className="text-sm text-foreground">{r.player_comp}</p>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
