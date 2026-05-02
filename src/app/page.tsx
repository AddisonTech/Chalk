import Link from "next/link";
import { Film, ClipboardList, BookOpen, LayoutDashboard, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleHeader } from "@/components/ModuleHeader";

const modules = [
  {
    href: "/film-room",
    icon: Film,
    title: "Film Room",
    blurb: "Tag plays, surface tendencies, and pull self-scout reports off raw film.",
  },
  {
    href: "/board",
    icon: ClipboardList,
    title: "Board",
    blurb: "Evaluate prospects against your scheme and depth chart with fit scores.",
  },
  {
    href: "/playbook",
    icon: BookOpen,
    title: "Playbook",
    blurb: "Pull weekly game plans against the scout report and your personnel.",
  },
];

const layers = [
  {
    name: "Recognition",
    body: "Pattern detection on film and data: formations, motions, route concepts, recruiting traits.",
  },
  {
    name: "Analytics",
    body: "Statistical breakdowns and trend identification across your season and an opponent's tape.",
  },
  {
    name: "Recommendation",
    body: "Actionable coaching suggestions: what to call, who to recruit, what to install this week.",
  },
];

export default function Home() {
  return (
    <div>
      <ModuleHeader
        icon={LayoutDashboard}
        label="Dashboard"
        title="Chalk"
        description="A coaching workspace that ties film breakdown, recruiting evaluation, and game-plan recommendations into one tool."
      />

      <div className="px-8 py-8 space-y-10">
        <section>
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Modules
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {modules.map(({ href, icon: Icon, title, blurb }) => (
              <Link key={href} href={href} className="group">
                <Card className="h-full transition-colors hover:border-primary/60">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="grid h-10 w-10 place-items-center rounded-md bg-secondary">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <CardTitle className="mt-4">{title}</CardTitle>
                    <CardDescription>{blurb}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Intelligence layers
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {layers.map(({ name, body }) => (
              <Card key={name}>
                <CardContent className="pt-6">
                  <div className="text-[10px] uppercase tracking-widest text-primary">
                    {name}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
