"use client";

import { useRef, useState, useTransition } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPlay } from "@/app/actions/film-room";

interface Props {
  gameId: string;
  open: boolean;
  onClose: () => void;
}

const PLAY_TYPES = ["run", "pass", "rpo", "screen", "trick", "qb_run", "penalty", "special_teams", "punt", "fg", "kick", "special", "other"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function TagPlayDialog({ gameId, open, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setError(null);
    const fd = new FormData(formRef.current);
    startTransition(async () => {
      const res = await createPlay(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      formRef.current?.reset();
      onClose();
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Tag play" className="max-w-lg">
      <form ref={formRef} onSubmit={submit} className="flex flex-col gap-4">
        <input type="hidden" name="game_id" value={gameId} />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Timestamp start (s)">
            <Input name="timestamp_start" type="number" min={0} />
          </Field>
          <Field label="Timestamp end (s)">
            <Input name="timestamp_end" type="number" min={0} />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Down">
            <Input name="down" type="number" min={1} max={4} />
          </Field>
          <Field label="Distance">
            <Input name="distance" type="number" min={0} />
          </Field>
          <Field label="Yard line">
            <Input name="yard_line" type="number" min={1} max={100} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Formation">
            <Input name="formation" />
          </Field>
          <Field label="Personnel">
            <Input name="personnel" placeholder="11, 12, 21..." />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Motion">
            <Input name="motion" />
          </Field>
          <Field label="Concept">
            <Input name="concept" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Play type">
            <select
              name="play_type"
              className="h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">--</option>
              {PLAY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Result">
            <Input name="result" placeholder="+5 yds, TD, incomplete..." />
          </Field>
        </div>

        <Field label="Notes">
          <Input name="notes" />
        </Field>

        {error && <p className="text-xs text-danger">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save play"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
