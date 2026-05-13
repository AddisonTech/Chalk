"use client";

import { useState, useTransition, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getCustomMeasurables,
  createCustomMeasurable,
  deleteCustomMeasurable,
} from "@/app/actions/custom-measurables";

interface CustomMeasurable {
  id: string;
  name: string;
  unit: string | null;
  type: string | null;
}

interface Props {
  onBack: () => void;
}

export function CustomMeasurablesManager({ onBack }: Props) {
  const [measurables, setMeasurables] = useState<CustomMeasurable[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function load() {
    startTransition(async () => {
      const data = await getCustomMeasurables();
      setMeasurables(data as CustomMeasurable[]);
    });
  }

  useEffect(() => { load(); }, []);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    startTransition(async () => {
      const result = await createCustomMeasurable(fd);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      form.reset();
      setAdding(false);
      load();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteCustomMeasurable(id);
      load();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to profiles
        </button>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Custom Measurables</span>
      </div>

      {measurables.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground">No custom measurables yet. Add one to track position-specific data.</p>
      )}

      {measurables.length > 0 && (
        <div className="flex flex-col divide-y divide-border rounded-sm border border-border">
          {measurables.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-3 py-2.5">
              <div>
                <span className="text-sm text-foreground">{m.name}</span>
                {m.unit && <span className="ml-1.5 text-xs text-muted-foreground">({m.unit})</span>}
              </div>
              <button
                onClick={() => handleDelete(m.id)}
                disabled={pending}
                className="rounded p-1 text-muted-foreground transition-colors hover:text-danger disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-sm border border-border bg-surface p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">New measurable</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Name</Label>
              <Input name="name" required placeholder="Arm length" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Unit</Label>
              <Input name="unit" placeholder='inches' />
            </div>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => { setAdding(false); setError(null); }}>Cancel</Button>
            <Button type="submit" size="sm" disabled={pending}>Add</Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add measurable
        </Button>
      )}
    </div>
  );
}
