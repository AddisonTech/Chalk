import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { Header } from "@/components/layout/header";
import { EmptyState } from "@/components/ui/empty-state";
import { BoardClient } from "@/components/board/board-client";
import { getRecruits } from "@/app/actions/board";

const TIER_COLORS: Record<string, string> = {
  take: "bg-success/10 text-success border border-success/25",
  developmental: "bg-primary/10 text-accent border border-primary/25",
  watch: "bg-surface-raised text-muted-foreground border border-border",
  pass: "bg-danger/10 text-danger border border-danger/25",
};

const TIER_LABELS: Record<string, string> = {
  take: "Take",
  developmental: "Dev",
  watch: "Watch",
  pass: "Pass",
};

export default async function Board() {
  const recruits = await getRecruits();

  return (
    <>
      <Header
        title="Board"
        description="Recruiting evaluations, scheme fit, and position boards."
        actions={<BoardClient />}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-10">
          {recruits.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Board is empty"
              description="Add prospects to evaluate scheme fit and build your position board."
            />
          ) : (
            <div className="overflow-hidden rounded-sm border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-left">
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Pos</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Class</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">School</th>
                    <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Tier</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Scheme fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-background">
                  {recruits.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-surface/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/board/${r.id}`}
                          className="font-medium text-foreground hover:text-accent transition-colors"
                        >
                          {r.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.position}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.class_year ?? "-"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {[r.high_school, r.state].filter(Boolean).join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {r.tier && (
                          <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium ${TIER_COLORS[r.tier] ?? ""}`}>
                            {TIER_LABELS[r.tier] ?? r.tier}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs">
                        {r.scheme_fit_score != null ? (
                          <span className={
                            r.scheme_fit_score >= 75 ? "text-success" :
                            r.scheme_fit_score >= 50 ? "text-foreground" : "text-muted-foreground"
                          }>
                            {r.scheme_fit_score}
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
          )}
        </div>
      </div>
    </>
  );
}
