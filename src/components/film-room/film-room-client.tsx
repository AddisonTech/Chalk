"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddGameDialog } from "@/components/film-room/add-game-dialog";

export function FilmRoomClient() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" strokeWidth={2} />
        Add Game
      </Button>
      <AddGameDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
