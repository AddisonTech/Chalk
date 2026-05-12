"use client";

import { useState } from "react";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TagPlayDialog } from "./tag-play-dialog";

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
  plays: Play[];
}

function fmtSituation(play: Play) {
  if (!play.down) return "--";
  const dist = play.distance ?? "?";
  return `${play.down}&${dist}`;
}

function fmtTs(s: number | null) {
  if (s == null) return "--";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function PlayTaggingView({ gameId, plays }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{plays.length} play{plays.length !== 1 ? "s" : ""} tagged</span>
        <Button size="sm" onClick={() => setDialogOpen(true)}>Tag play</Button>
      </div>

      {plays.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No plays tagged yet"
          description="Tag plays to start building your film database."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Dn & Dist</TableHead>
              <TableHead>Yd Ln</TableHead>
              <TableHead>Formation</TableHead>
              <TableHead>Pers</TableHead>
              <TableHead>Concept</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plays.map((p) => (
              <TableRow key={p.id} className="hover:bg-surface-hover transition-colors">
                <TableCell className="tabular-nums text-muted-foreground">
                  {fmtTs(p.timestamp_start)}
                </TableCell>
                <TableCell>{fmtSituation(p)}</TableCell>
                <TableCell>{p.yard_line ?? "--"}</TableCell>
                <TableCell>{p.formation ?? "--"}</TableCell>
                <TableCell>{p.personnel ?? "--"}</TableCell>
                <TableCell>{p.concept ?? "--"}</TableCell>
                <TableCell>{p.play_type ?? "--"}</TableCell>
                <TableCell>{p.result ?? "--"}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">{p.notes ?? ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <TagPlayDialog gameId={gameId} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
