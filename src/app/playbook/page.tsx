import { BookOpen } from "lucide-react";
import { Header } from "@/components/layout/header";
import { EmptyState } from "@/components/ui/empty-state";

export default function Playbook() {
  return (
    <>
      <Header
        title="Playbook"
        description="Weekly game plans, practice priorities, situational call sheets."
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-8 py-10">
          <EmptyState
            icon={BookOpen}
            title="No weekly plans yet"
            description="Once Film Room has opponent data, the Playbook will generate prep output — situational calls, tendency attacks, and practice scripts."
          />
        </div>
      </div>
    </>
  );
}
