"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGame } from "@/app/actions/film-room";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddGameDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createGame(fd);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      onClose();
      if ("gameId" in result && result.gameId) {
        router.push(`/film-room/${result.gameId}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Add Game">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Opponent</Label>
          <Input name="opponent_name" required placeholder="Riverside High" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Season</Label>
            <Input
              name="season"
              type="number"
              required
              defaultValue={new Date().getFullYear()}
              min={2000}
              max={2099}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Week</Label>
            <Input name="week" type="number" min={1} max={20} placeholder="6" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Game date</Label>
            <Input name="game_date" type="date" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Location</Label>
            <select
              name="is_home"
              defaultValue="true"
              className="h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="true">Home</option>
              <option value="false">Away</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Game type</Label>
          <select
            name="game_type"
            defaultValue="regular"
            className="h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="regular">Regular season</option>
            <option value="playoff">Playoff</option>
            <option value="scrimmage">Scrimmage</option>
            <option value="spring">Spring game</option>
          </select>
        </div>

        {error && <p className="text-xs text-danger" role="alert">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Add game"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
