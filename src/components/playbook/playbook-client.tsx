"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewPlanDialog } from "@/components/playbook/new-plan-dialog";

export function PlaybookClient() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" strokeWidth={2} />
        New plan
      </Button>
      <NewPlanDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
