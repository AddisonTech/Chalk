import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon: Icon,
  className,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-surface/50 px-8 py-20 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-border-strong bg-background">
        <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
