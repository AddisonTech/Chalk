import { Film } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ModuleHeader";

const features = [
  {
    title: "Play tagging",
    body: "Stamp formation, personnel, motion, concept, and result on every clip without leaving the timeline.",
  },
  {
    title: "Tendency reports",
    body: "Down-and-distance splits, hash splits, red zone calls, and self-scout exposure across the season.",
  },
  {
    title: "Opponent breakdown",
    body: "Pull a full scout from cut-ups: what they call, when they call it, and what beats it.",
  },
];

export default function FilmRoom() {
  return (
    <div>
      <ModuleHeader
        icon={Film}
        label="Film Room"
        title="Film breakdown and tendency analysis"
        description="Cut, tag, and report on game film. Build self-scout and opponent reports faster than the QC room."
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
