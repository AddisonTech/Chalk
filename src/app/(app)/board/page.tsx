import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ModuleHeader";

const features = [
  {
    title: "Prospect cards",
    body: "Bio, measurables, school, position grades, and source tape on every prospect.",
  },
  {
    title: "Scheme fit score",
    body: "Match a prospect's traits against your offensive and defensive scheme requirements.",
  },
  {
    title: "Depth chart context",
    body: "Where this prospect lands on your board given current roster and graduating class.",
  },
];

export default function Board() {
  return (
    <div>
      <ModuleHeader
        icon={ClipboardList}
        label="Board"
        title="Recruiting evaluation and fit scores"
        description="Build the recruiting board for your scheme: traits-first evaluation with depth chart context baked in."
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
