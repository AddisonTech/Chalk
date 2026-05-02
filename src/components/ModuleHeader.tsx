import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  title: string;
  description: string;
};

export function ModuleHeader({ icon: Icon, label, title, description }: Props) {
  return (
    <div className="border-b border-border bg-field-stripes">
      <div className="px-8 py-10">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {label}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
