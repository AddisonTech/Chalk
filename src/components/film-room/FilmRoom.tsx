"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CalendarDays, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Film, Play } from "@/lib/types";
import { TagPlayDialog } from "@/components/film-room/TagPlayDialog";

type Props = {
  films: Film[];
  selectedFilmId: string | null;
  plays: Play[];
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDown(p: Play) {
  if (!p.down) return "-";
  const dist = p.distance == null ? "" : ` & ${p.distance}`;
  return `${p.down}${dist}`;
}

export function FilmRoom({ films, selectedFilmId, plays }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [tagOpen, setTagOpen] = useState(false);

  const selectedFilm = useMemo(
    () => films.find((f) => f.id === selectedFilmId) ?? null,
    [films, selectedFilmId]
  );

  function selectFilm(id: string) {
    const sp = new URLSearchParams(params.toString());
    sp.set("film", id);
    router.replace(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex h-full">
      {/* Films list */}
      <div className="w-72 shrink-0 border-r border-border bg-sidebar/40 overflow-y-auto">
        <div className="px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
          Films
        </div>
        {films.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            No films yet. Create one in Supabase or via the upload flow.
          </div>
        ) : (
          <ul>
            {films.map((film) => {
              const active = film.id === selectedFilmId;
              return (
                <li key={film.id}>
                  <button
                    type="button"
                    onClick={() => selectFilm(film.id)}
                    className={cn(
                      "flex w-full flex-col items-start gap-1 px-4 py-3 text-left text-sm transition-colors border-l-2",
                      active
                        ? "border-primary bg-secondary/40 text-foreground"
                        : "border-transparent text-foreground/80 hover:bg-secondary/30 hover:text-foreground"
                    )}
                  >
                    <span className="font-medium">{film.title}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {film.opponent ? <span>vs {film.opponent}</span> : null}
                      {film.game_date ? (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {film.game_date}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Plays table */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border">
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {selectedFilm?.title ?? "No film selected"}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {selectedFilm?.opponent ? `vs ${selectedFilm.opponent}` : ""}
              {selectedFilm?.game_date ? `  -  ${selectedFilm.game_date}` : ""}
              {plays.length > 0 ? `  -  ${plays.length} plays tagged` : ""}
            </div>
          </div>
          {selectedFilm ? (
            <Button size="sm" onClick={() => setTagOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Tag play
            </Button>
          ) : null}
        </div>

        <div className="flex-1 overflow-auto">
          {selectedFilm ? (
            plays.length === 0 ? (
              <div className="px-6 py-8 text-sm text-muted-foreground">
                No plays tagged yet.{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => setTagOpen(true)}
                >
                  Tag the first one
                </button>
                .
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-16">Time</TableHead>
                    <TableHead className="w-20">Down</TableHead>
                    <TableHead className="w-20">Yard</TableHead>
                    <TableHead>Formation</TableHead>
                    <TableHead className="w-16">Pers.</TableHead>
                    <TableHead>Concept</TableHead>
                    <TableHead className="w-20">Type</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plays.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {formatTime(p.timestamp_start)}
                      </TableCell>
                      <TableCell>{formatDown(p)}</TableCell>
                      <TableCell>
                        {p.yard_line == null ? "-" : p.yard_line}
                      </TableCell>
                      <TableCell>{p.formation ?? "-"}</TableCell>
                      <TableCell>{p.personnel ?? "-"}</TableCell>
                      <TableCell>{p.concept ?? "-"}</TableCell>
                      <TableCell className="capitalize">
                        {p.play_type ?? "-"}
                      </TableCell>
                      <TableCell>{p.result ?? "-"}</TableCell>
                      <TableCell className="max-w-[24ch] truncate text-muted-foreground">
                        {p.notes ?? ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : (
            <div className="px-6 py-8 text-sm text-muted-foreground">
              Pick a film from the list, or seed one via the migrations to get
              started.{" "}
              <Link href="/" className="text-primary hover:underline">
                Back to dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      {selectedFilm ? (
        <TagPlayDialog
          open={tagOpen}
          onOpenChange={setTagOpen}
          filmId={selectedFilm.id}
        />
      ) : null}
    </div>
  );
}
