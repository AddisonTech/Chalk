import { ClipboardList, Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function Board() {
  return (
    <>
      <Header
        title="Board"
        description="Recruiting evaluations, scheme fit, and position boards."
        actions={
          <Button disabled>
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add Recruit
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-10">
          <EmptyState
            icon={ClipboardList}
            title="Board is empty"
            description="Add prospects to evaluate film, grade measurables, and run scheme-fit scoring against your system."
          />
        </div>
      </div>
    </>
  );
}
