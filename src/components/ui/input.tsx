import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-foreground placeholder:text-muted transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
