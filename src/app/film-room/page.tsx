import { Film, Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function FilmRoom() {
  return (
    <>
      <Header
        title="Film Room"
        description="Opponent breakdown, self-scout, and tendency reports."
        actions={
          <Button disabled>
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add Game
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-10">
          <EmptyState
            icon={Film}
            title="No games charted yet"
            description="Load opponent or self-scout film, then tag plays to unlock tendency splits, situational reports, and personnel usage."
          />
        </div>
      </div>
    </>
  );
}
