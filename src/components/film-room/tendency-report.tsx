"use client";

import { generateTendency } from "@/lib/tendency";

interface Props {
  opponentName: string;
}

function Bar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function SplitRow({ label, run, pass }: { label: string; run: number; pass: number }) {
  return (
    <div className="flex items-center gap-4 py-2.5 border-b border-border last:border-0">
      <div className="w-32 flex-shrink-0 text-xs text-muted-foreground">{label}</div>
      <div className="flex flex-1 items-center gap-2">
        <span className="w-8 text-right text-xs font-mono text-foreground">{run}%</span>
        <div className="flex-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
            <div className="h-full rounded-full bg-accent" style={{ width: `${run}%` }} />
          </div>
        </div>
        <span className="w-12 text-xs text-muted-foreground">Run</span>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <span className="w-8 text-right text-xs font-mono text-foreground">{pass}%</span>
        <div className="flex-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pass}%` }} />
          </div>
        </div>
        <span className="w-12 text-xs text-muted-foreground">Pass</span>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-border bg-surface p-5">
      <div className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

export function TendencyReport({ opponentName }: Props) {
  const data = generateTendency(opponentName);

  return (
    <div className="flex flex-col gap-5">

      <div className="rounded-sm border border-border bg-surface p-4 text-xs text-muted-foreground">
        Analysis generated from charted film. Review against your own scout notes before use.
      </div>

      {/* Overall run/pass */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Overall tendency">
          <div className="flex items-end gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-semibold tabular-nums text-foreground">{data.runPass.run}%</span>
              <span className="text-xs text-muted-foreground">Run</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-semibold tabular-nums text-foreground">{data.runPass.pass}%</span>
              <span className="text-xs text-muted-foreground">Pass</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
              <span>Run</span><span>Pass</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
              <div className="h-full rounded-full bg-accent" style={{ width: `${data.runPass.run}%` }} />
            </div>
          </div>
        </Card>

        {/* Insights */}
        <Card title="Scout notes">
          <ul className="flex flex-col gap-2.5">
            {data.insights.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
                {note}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* By down */}
      <Card title="Run / pass by down">
        {data.byDown.map(({ down, run, pass }) => (
          <SplitRow key={down} label={`${down}${["st","nd","rd","th"][down - 1]} down`} run={run} pass={pass} />
        ))}
      </Card>

      {/* Formations + Personnel */}
      <div className="grid grid-cols-2 gap-4">
        <Card title="Formation frequency">
          <div className="flex flex-col gap-3">
            {data.formations.map((f) => (
              <div key={f.name} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">{f.name}</span>
                  <span className="font-mono text-muted-foreground">{f.pct}%</span>
                </div>
                <Bar value={f.pct} color="bg-accent" />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Personnel groupings">
          <div className="flex flex-col gap-4">
            {data.personnel.map((p) => (
              <div key={p.code} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">{p.label}</span>
                  <span className="font-mono text-muted-foreground">{p.pct}%</span>
                </div>
                <Bar value={p.pct} color="bg-primary" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Situational */}
      <Card title="Situational analysis">
        <div className="grid grid-cols-2 gap-4">
          {data.situational.map((s) => (
            <div key={s.label} className="rounded-sm border border-border bg-background p-4">
              <div className="mb-2 text-xs font-medium text-foreground">{s.label}</div>
              <div className="mb-1 flex gap-4 text-xs">
                <span className="font-mono text-foreground">{s.run}% Run</span>
                <span className="font-mono text-muted-foreground">{s.pass}% Pass</span>
              </div>
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                <div className="h-full rounded-full bg-accent" style={{ width: `${s.run}%` }} />
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{s.note}</p>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}
