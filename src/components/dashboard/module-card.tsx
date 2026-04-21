import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Stat = { label: string; value: number | string };

export function ModuleCard({
  href,
  title,
  description,
  stats,
  icon: Icon,
  accent,
}: {
  href: string;
  title: string;
  description: string;
  stats: Stat[];
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col gap-6 border border-border bg-surface p-6 transition-colors",
        "hover:border-border-strong hover:bg-surface-raised",
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-sm border border-border-strong bg-background",
            accent && "border-accent/40 bg-primary",
          )}
        >
          <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </div>
        <ArrowUpRight
          className="h-4 w-4 text-muted transition-colors group-hover:text-foreground"
          strokeWidth={1.75}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-4 border-t border-border pt-5">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {s.value}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
}
