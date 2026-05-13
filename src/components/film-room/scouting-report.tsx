"use client";

import { useState, useTransition } from "react";
import { FileText, RefreshCw } from "lucide-react";
import { generateScoutingReport } from "@/app/actions/scouting";

interface Props {
  gameId: string;
  opponentName: string;
}

function renderReport(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line.trim()) {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Bold headers like **Section Title**
    if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <h3 key={i} className="mt-5 mb-1.5 text-xs font-semibold uppercase tracking-wider text-foreground first:mt-0">
          {line.slice(2, -2)}
        </h3>
      );
      continue;
    }

    // Bullet points
    if (line.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex items-start gap-2 py-0.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <p className="text-sm leading-relaxed text-muted-foreground">{line.slice(2)}</p>
        </div>
      );
      continue;
    }

    // Inline bold
    if (line.includes("**")) {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={i} className="text-sm leading-relaxed text-muted-foreground">
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j} className="font-medium text-foreground">{part.slice(2, -2)}</strong>
            ) : (
              part
            )
          )}
        </p>
      );
      continue;
    }

    elements.push(
      <p key={i} className="text-sm leading-relaxed text-muted-foreground">{line}</p>
    );
  }

  return elements;
}

export function ScoutingReport({ gameId, opponentName }: Props) {
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateScoutingReport(gameId);
      if (result.error) {
        setError(result.error);
      } else {
        setReport(result.report ?? null);
      }
    });
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center gap-5 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-border bg-surface">
          <FileText className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-foreground">AI Scouting Report</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Generates a coach-ready breakdown of {opponentName}&apos;s tendencies from your tagged film.
            Tag at least 5 plays with a play type to get started.
          </p>
        </div>
        {error && (
          <p className="max-w-sm text-xs text-danger">{error}</p>
        )}
        <button
          onClick={handleGenerate}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          {pending ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Report"
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="rounded-sm border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
          Generated from charted film. Review before use.
        </div>
        <button
          onClick={handleGenerate}
          disabled={pending}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      <div className="rounded-sm border border-border bg-surface p-6">
        <div className="mb-5 border-b border-border pb-4">
          <h2 className="text-base font-semibold text-foreground">{opponentName} - Scouting Report</h2>
        </div>
        <div className="flex flex-col gap-0.5">
          {renderReport(report)}
        </div>
      </div>
    </div>
  );
}
