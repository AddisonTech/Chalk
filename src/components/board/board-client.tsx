"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddRecruitDialog } from "@/components/board/add-recruit-dialog";

export function BoardClient() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" strokeWidth={2} />
        Add Recruit
      </Button>
      <AddRecruitDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
