"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Check } from "lucide-react";
import { recalculateRecruitEvaluations } from "@/app/actions/evaluations";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (hours < 48) return "yesterday";
  return `${Math.floor(hours / 24)} days ago`;
}

interface Props {
  recruitId: string;
  lastCalculatedAt: string | null;
}

export function RecalculateButton({ recruitId, lastCalculatedAt }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  async function handleClick() {
    setState("loading");
    await recalculateRecruitEvaluations(recruitId);
    setState("done");
    router.refresh();
    setTimeout(() => setState("idle"), 1600);
  }

  return (
    <div className="flex items-center gap-3">
      {lastCalculatedAt && (
        <span className="text-[10px] text-muted-foreground">
          Updated {formatRelativeTime(lastCalculatedAt)}
        </span>
      )}
      <button
        onClick={handleClick}
        disabled={state !== "idle"}
        className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs transition-colors disabled:cursor-not-allowed ${
          state === "done"
            ? "border-success/30 bg-success/10 text-success"
            : "border-border bg-surface text-muted-foreground hover:border-accent/40 hover:text-foreground disabled:opacity-50"
        }`}
      >
        {state === "loading" ? (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            Recalculating
          </>
        ) : state === "done" ? (
          <>
            <Check className="h-3 w-3" />
            Updated
          </>
        ) : (
          <>
            <RefreshCw className="h-3 w-3" />
            Recalculate
          </>
        )}
      </button>
    </div>
  );
}
