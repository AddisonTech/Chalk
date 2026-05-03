import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ModuleHeader";

const features = [
  {
    title: "Weekly call sheet",
    body: "Auto-built openers, third-down, red zone, and short-yardage calls against the opponent's tendencies.",
  },
  {
    title: "Personnel matchups",
    body: "Best calls for your starters versus their starters, weighted by your install for the week.",
  },
  {
    title: "Install priorities",
    body: "What to add, what to drop, and what to rep most this week against the upcoming opponent.",
  },
];

export default function Playbook() {
  return (
    <div>
      <ModuleHeader
        icon={BookOpen}
        label="Playbook"
        title="Game plan recommendations"
        description="Turn the scout report into a call sheet: opponent tendencies, your personnel, and the calls that win the matchup."
      />

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {features.map(({ title, body }) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{body}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Coming in v1
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
