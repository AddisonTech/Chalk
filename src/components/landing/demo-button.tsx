"use client";

import { useState, useTransition } from "react";
import { startDemoSession } from "@/app/actions/demo";

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-7 text-base",
};

export function DemoButton({ className, size = "lg" }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await startDemoSession();
      if (result?.error) {
        setError("Demo setup failed. Try again in a moment.");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={pending}
        className={[
          "inline-flex items-center justify-center gap-2.5 rounded-sm font-medium tracking-tight transition-all",
          "bg-accent text-white border border-accent-hover",
          "hover:bg-accent-hover active:scale-[0.98]",
          "disabled:opacity-60 disabled:pointer-events-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          sizeClasses[size],
          className ?? "",
        ].join(" ")}
      >
        {pending ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            Setting up your demo...
          </>
        ) : (
          "Try the Demo"
        )}
      </button>
      {error && (
        <p className="text-xs text-danger text-center">{error}</p>
      )}
    </div>
  );
}
