"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRecruit } from "@/app/actions/board";

const POSITIONS = ["QB","RB","FB","WR","TE","OT","OG","C","DE","DT","ILB","OLB","CB","S","K","P","LS"];
const TIERS = [
  { value: "take", label: "Take" },
  { value: "developmental", label: "Developmental" },
  { value: "watch", label: "Watch" },
  { value: "pass", label: "Pass" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AddRecruitDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createRecruit(fd);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      onClose();
      if ("recruitId" in result && result.recruitId) {
        router.push(`/board/${result.recruitId}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onClose={onClose} title="Add Recruit" className="max-w-lg">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>Full name</Label>
            <Input name="name" required placeholder="Jordan Williams" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Position</Label>
            <select
              name="position"
              required
              className="h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">Select</option>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Class year</Label>
            <Input name="class_year" type="number" min={2024} max={2032} placeholder="2027" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>High school</Label>
            <Input name="high_school" placeholder="Riverside High" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>State</Label>
            <Input name="state" maxLength={2} placeholder="SC" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tier</Label>
            <select
              name="tier"
              defaultValue="watch"
              className="h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Scheme fit (0-100)</Label>
            <Input name="scheme_fit_score" type="number" min={0} max={100} placeholder="72" />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>Notes</Label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Quick off the line, good hands..."
              className="w-full rounded-sm border border-border-strong bg-surface px-3 py-2.5 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
          </div>
        </div>

        {error && <p className="text-xs text-danger" role="alert">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Add recruit"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
