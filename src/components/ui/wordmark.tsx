import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-5xl",
  };
  return (
    <span
      className={cn(
        "font-semibold tracking-[0.18em] text-foreground",
        sizes[size],
        className,
      )}
    >
      CHALK
    </span>
  );
}
