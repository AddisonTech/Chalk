"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { PlayType } from "@/lib/types";

const PLAY_TYPES: PlayType[] = [
  "run",
  "pass",
  "screen",
  "rpo",
  "qb_run",
  "punt",
  "fg",
  "kick",
  "special",
  "other",
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filmId: string;
};

export function TagPlayDialog({ open, onOpenChange, filmId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    const get = (k: string) => {
      const v = formData.get(k);
      return v == null ? null : String(v);
    };
    const num = (k: string) => {
      const v = get(k);
      if (!v) return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    startTransition(async () => {
      const supabase = createClient();
      const { data: userResult } = await supabase.auth.getUser();
      const userId = userResult.user?.id;
      if (!userId) {
        setError("You must be signed in to tag plays.");
        return;
      }

      const startSec = num("timestamp_start");
      if (startSec == null) {
        setError("Start time is required.");
        return;
      }

      const playType = get("play_type");

      const { error: insertError } = await supabase.from("plays").insert({
        film_id: filmId,
        timestamp_start: startSec,
        timestamp_end: num("timestamp_end"),
        down: num("down"),
        distance: num("distance"),
        yard_line: num("yard_line"),
        formation: get("formation") || null,
        personnel: get("personnel") || null,
        motion: get("motion") || null,
        concept: get("concept") || null,
        play_type: playType ? (playType as PlayType) : null,
        result: get("result") || null,
        notes: get("notes") || null,
        tagged_by: userId,
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Tag a play</DialogTitle>
          <DialogDescription>
            Add details now or save what you have and edit later.
          </DialogDescription>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="timestamp_start">Start (s)</Label>
              <Input
                id="timestamp_start"
                name="timestamp_start"
                type="number"
                min={0}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="timestamp_end">End (s)</Label>
              <Input id="timestamp_end" name="timestamp_end" type="number" min={0} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="play_type">Type</Label>
              <select
                id="play_type"
                name="play_type"
                defaultValue=""
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                <option value="">-</option>
                {PLAY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="down">Down</Label>
              <Input id="down" name="down" type="number" min={1} max={4} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="distance">Distance</Label>
              <Input id="distance" name="distance" type="number" min={0} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="yard_line">Yard line</Label>
              <Input id="yard_line" name="yard_line" type="number" min={0} max={100} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="formation">Formation</Label>
              <Input id="formation" name="formation" placeholder="Trips Right" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="personnel">Personnel</Label>
              <Input id="personnel" name="personnel" placeholder="11" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="motion">Motion</Label>
              <Input id="motion" name="motion" placeholder="Z-jet" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="concept">Concept</Label>
              <Input id="concept" name="concept" placeholder="Stick" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="result">Result</Label>
              <Input id="result" name="result" placeholder="+8 yds, 1st" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" placeholder="Slot won the rep" />
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save play"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
