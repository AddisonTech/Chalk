"use client";

import { useState } from "react";
import { TendencyReport } from "./tendency-report";
import { PlayTaggingView } from "./play-tagging-view";

type Play = {
  id: string;
  timestamp_start: number | null;
  timestamp_end: number | null;
  down: number | null;
  distance: number | null;
  yard_line: number | null;
  formation: string | null;
  personnel: string | null;
  motion: string | null;
  concept: string | null;
  play_type: string | null;
  result: string | null;
  notes: string | null;
};

interface Props {
  gameId: string;
  opponentName: string;
  plays: Play[];
}

const TABS = [
  { key: "tendency", label: "Tendency Report" },
  { key: "plays", label: "Tagged Plays" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export function GameDetailClient({ gameId, opponentName, plays }: Props) {
  const [tab, setTab] = useState<Tab>("tendency");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              "px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors",
              tab === t.key
                ? "border-b-2 border-accent text-foreground"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tendency" && <TendencyReport opponentName={opponentName} />}
      {tab === "plays" && <PlayTaggingView gameId={gameId} plays={plays} />}
    </div>
  );
}
