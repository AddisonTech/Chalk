"use client";

import { useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddRecruitDialog } from "@/components/board/add-recruit-dialog";
import { SchemePanel } from "@/components/board/scheme-panel";

export function BoardClient() {
  const [addOpen, setAddOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" onClick={() => setPanelOpen(true)}>
        <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
        Scheme Profiles
      </Button>
      <Button onClick={() => setAddOpen(true)}>
        <Plus className="h-4 w-4" strokeWidth={2} />
        Add Recruit
      </Button>
      <AddRecruitDialog open={addOpen} onClose={() => setAddOpen(false)} />
      <SchemePanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </>
  );
}
