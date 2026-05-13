"use client";

import { generateTendency, type TendencyReport as TendencyData } from "@/lib/tendency";

type Play = {
  down: number | null;
  distance: number | null;
  yard_line: number | null;
  formation: string | null;
  personnel: string | null;
  play_type: string | null;
};

interface Props {
  opponentName: string;
  plays: Play[];
}

function pct(n: number, d: number) { return d > 0 ? Math.round((n / d) * 100) : 0; }

function computeFromPlays(opponentName: string, plays: Play[]): TendencyData {
  const typed = plays.filter((p) => p.play_type === "run" || p.play_type === "pass");
  if (typed.length < 5) return generateTendency(opponentName);

  const runs = typed.filter((p) => p.play_type === "run").length;
  const passes = typed.filter((p) => p.play_type === "pass").length;
  const total = runs + passes;

  const byDown = [1, 2, 3, 4].map((down) => {
    const dp = typed.filter((p) => p.down === down);
    const dr = dp.filter((p) => p.play_type === "run").length;
    const t = dp.length || 1;
    return { down, run: pct(dr, t), pass: pct(dp.length - dr, t) };
  });

  const formCount: Record<string, number> = {};
  for (const p of typed) {
    if (p.formation) formCount[p.formation] = (formCount[p.formation] ?? 0) + 1;
  }
  const formations = Object.entries(formCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, pct: pct(count, typed.length) }));

  const persCount: Record<string, number> = {};
  for (const p of typed) {
    if (p.personnel) persCount[p.personnel] = (persCount[p.personnel] ?? 0) + 1;
  }
  const personnel = Object.entries(persCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([code, count]) => ({ code, label: `${code} personnel`, pct: pct(count, typed.length) }));

  const rz = typed.filter((p) => p.yard_line !== null && p.yard_line <= 20);
  const rzRun = rz.filter((p) => p.play_type === "run").length;
  const rzPass = rz.length - rzRun;

  const t3s = typed.filter((p) => p.down === 3 && (p.distance ?? 99) <= 3);
  const t3sRun = t3s.filter((p) => p.play_type === "run").length;

  const t3l = typed.filter((p) => p.down === 3 && (p.distance ?? 0) >= 7);
  const t3lRun = t3l.filter((p) => p.play_type === "run").length;

  const situational = [
    {
      label: "Red Zone",
      run: pct(rzRun, rz.length || 1),
      pass: pct(rzPass, rz.length || 1),
      note: rz.length >= 3 ? `${rz.length} charted red zone plays.` : "Limited red zone sample.",
    },
    {
      label: "3rd and Short (1-3)",
      run: pct(t3sRun, t3s.length || 1),
      pass: pct(t3s.length - t3sRun, t3s.length || 1),
      note: t3s.length >= 3 ? `${t3s.length} charted plays.` : "Limited sample.",
    },
    {
      label: "3rd and Long (7+)",
      run: pct(t3lRun, t3l.length || 1),
      pass: pct(t3l.length - t3lRun, t3l.length || 1),
      note: t3l.length >= 3 ? `${t3l.length} charted plays.` : "Limited sample.",
    },
    {
      label: "1st Down",
      run: byDown[0].run,
      pass: byDown[0].pass,
      note: `${typed.filter((p) => p.down === 1).length} charted 1st down plays.`,
    },
  ];

  const insights: string[] = [];
  if (pct(runs, total) > 55) insights.push(`Run-heavy offense - ${pct(runs, total)}% run rate across ${total} plays.`);
  else if (pct(passes, total) > 60) insights.push(`Pass-heavy offense - ${pct(passes, total)}% pass rate across ${total} plays.`);
  else insights.push(`Balanced attack: ${pct(runs, total)}% run, ${pct(passes, total)}% pass across ${total} plays.`);

  if (t3l.length >= 3) insights.push(`${pct(t3l.length - t3lRun, t3l.length)}% pass rate on 3rd and long.`);
  if (rz.length >= 3) insights.push(`${pct(rzRun, rz.length)}% run rate in the red zone (${rz.length} plays).`);
  else insights.push(`${typed.length} total plays charted. Add more to improve accuracy.`);

  return {
    runPass: { run: pct(runs, total), pass: pct(passes, total) },
    byDown,
    formations: formations.length > 0 ? formations : generateTendency(opponentName).formations,
    personnel: personnel.length > 0 ? personnel : generateTendency(opponentName).personnel,
    situational,
    insights: insights.slice(0, 3),
  };
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
    <div className="flex items-center gap-4 border-b border-border py-2.5 last:border-0">
      <div className="w-32 shrink-0 text-xs text-muted-foreground">{label}</div>
      <div className="flex flex-1 items-center gap-2">
        <span className="w-8 text-right font-mono text-xs text-foreground">{run}%</span>
        <div className="flex-1"><Bar value={run} color="bg-accent" /></div>
        <span className="w-12 text-xs text-muted-foreground">Run</span>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <span className="w-8 text-right font-mono text-xs text-foreground">{pass}%</span>
        <div className="flex-1"><Bar value={pass} color="bg-primary" /></div>
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

export function TendencyReport({ opponentName, plays }: Props) {
  const hasRealData = plays.filter((p) => p.play_type === "run" || p.play_type === "pass").length >= 5;
  const data = computeFromPlays(opponentName, plays);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-sm border border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
        {hasRealData
          ? `Analysis from ${plays.filter((p) => p.play_type === "run" || p.play_type === "pass").length} tagged plays. Review against your own scout notes before use.`
          : "Fewer than 5 typed plays tagged — showing illustrative data. Tag plays to see real tendencies."}
      </div>

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

        <Card title="Scout notes">
          <ul className="flex flex-col gap-2.5">
            {data.insights.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {note}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Run / pass by down">
        {data.byDown.map(({ down, run, pass }) => (
          <SplitRow key={down} label={`${down}${["st","nd","rd","th"][down - 1]} down`} run={run} pass={pass} />
        ))}
      </Card>

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
