import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { getRecruit } from "@/app/actions/board";

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

export default async function RecruitDetail({ params }: Props) {
  const { recruitId } = await params;
  const r = await getRecruit(recruitId);
  if (!r) notFound();

  const hasGrades = r.film_grade != null || r.athleticism_grade != null || r.technique_grade != null || r.football_iq_grade != null;
  const location = [r.city, r.state].filter(Boolean).join(", ");

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
                    {r.notes && (
                      <div>
                        <div className="mb-1 text-xs text-muted-foreground">Notes</div>
                        <p className="text-sm leading-relaxed text-foreground">{r.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(r.forty_yard || r.shuttle || r.vertical || r.broad_jump) && (
                <div className="rounded-sm border border-border bg-surface p-5">
                  <div className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Testing</div>
                  <div className="grid grid-cols-4 gap-4">
                    {r.forty_yard && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">40-yd dash</span>
                        <span className="text-xl font-semibold tabular-nums text-foreground">{r.forty_yard}s</span>
                      </div>
                    )}
                    {r.shuttle && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Shuttle</span>
                        <span className="text-xl font-semibold tabular-nums text-foreground">{r.shuttle}s</span>
                      </div>
                    )}
                    {r.vertical && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Vertical</span>
                        <span className="text-xl font-semibold tabular-nums text-foreground">{r.vertical}"</span>
                      </div>
                    )}
                    {r.broad_jump && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Broad jump</span>
                        <span className="text-xl font-semibold tabular-nums text-foreground">{r.broad_jump}"</span>
                      </div>
                    )}
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
                  {r.scheme_fit_score != null && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Scheme fit</span>
                        <span className={`font-mono font-semibold ${r.scheme_fit_score >= 75 ? "text-success" : r.scheme_fit_score >= 50 ? "text-foreground" : "text-muted-foreground"}`}>
                          {r.scheme_fit_score}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                        <div className="h-full rounded-full bg-accent" style={{ width: `${r.scheme_fit_score}%` }} />
                      </div>
                    </div>
                  )}
                  {r.offer_status && r.offer_status !== "not_offered" && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Status</span>
                      <span className="text-xs capitalize text-foreground">{r.offer_status.replace("_", " ")}</span>
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
