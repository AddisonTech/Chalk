"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Plus, Settings2, RefreshCw, Check } from "lucide-react";
import { getSchemeProfiles } from "@/app/actions/scheme-profiles";
import { recalculateAllEvaluations } from "@/app/actions/evaluations";
import { SchemeProfileEditor } from "@/components/board/scheme-profile-editor";
import { CustomMeasurablesManager } from "@/components/board/custom-measurables-manager";

type Selected =
  | null
  | { type: "new" }
  | { type: "profile"; id: string; name?: string; position?: string | null; schemeTag?: string | null }
  | { type: "custom-measurables" };

type RecalcState = "idle" | "confirm" | "running" | "done";

interface SchemeProfile {
  id: string;
  name: string | null;
  position: string | null;
  scheme_tag: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SchemePanel({ open, onClose }: Props) {
  const [selected, setSelected] = useState<Selected>(null);
  const [profiles, setProfiles] = useState<SchemeProfile[]>([]);
  const [pending, startTransition] = useTransition();
  const [recalcState, setRecalcState] = useState<RecalcState>("idle");

  function loadProfiles() {
    startTransition(async () => {
      const data = await getSchemeProfiles();
      setProfiles(data as SchemeProfile[]);
    });
  }

  useEffect(() => {
    if (open) {
      loadProfiles();
      setSelected(null);
      setRecalcState("idle");
    }
  }, [open]);

  function handleRecalcAll() {
    if (recalcState === "idle") { setRecalcState("confirm"); return; }
    if (recalcState === "confirm") {
      setRecalcState("running");
      startTransition(async () => {
        await recalculateAllEvaluations();
        setRecalcState("done");
        setTimeout(() => setRecalcState("idle"), 2000);
      });
    }
  }

  const selectedProfileId = selected?.type === "profile" ? selected.id : null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed right-0 top-0 z-40 flex h-full w-[600px] flex-col bg-background shadow-2xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="text-sm font-semibold text-foreground">Scheme Profiles</span>
          <div className="flex items-center gap-3">
            {recalcState === "confirm" ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Recalculate all?</span>
                <button onClick={handleRecalcAll} className="text-accent hover:underline">Yes</button>
                <button onClick={() => setRecalcState("idle")} className="text-muted-foreground hover:text-foreground">No</button>
              </div>
            ) : (
              <button
                onClick={handleRecalcAll}
                disabled={recalcState === "running" || pending}
                title="Recalculate all evaluations"
                className={`flex items-center gap-1 rounded p-1 text-xs transition-colors disabled:opacity-40 ${
                  recalcState === "done" ? "text-success" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {recalcState === "running" ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : recalcState === "done" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left column: always-visible profile list */}
          <div className="flex w-44 shrink-0 flex-col border-r border-border">
            <div className="flex-1 overflow-y-auto py-2">
              {profiles.length === 0 && !pending && (
                <p className="px-3 py-2 text-[11px] text-muted-foreground">No profiles yet.</p>
              )}
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() =>
                    setSelected({
                      type: "profile",
                      id: p.id,
                      name: p.name ?? undefined,
                      position: p.position,
                      schemeTag: p.scheme_tag,
                    })
                  }
                  className={`w-full px-3 py-2 text-left transition-colors hover:bg-surface-raised ${
                    selectedProfileId === p.id ? "bg-surface-raised" : ""
                  }`}
                >
                  <div className="truncate text-xs font-medium text-foreground">{p.name}</div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    {p.position && <span>{p.position}</span>}
                    {p.position && p.scheme_tag && <span>·</span>}
                    {p.scheme_tag && <span>{p.scheme_tag}</span>}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-1 border-t border-border px-3 py-3">
              <button
                onClick={() => setSelected({ type: "new" })}
                className={`flex items-center gap-1.5 rounded py-1 text-xs transition-colors hover:text-foreground ${
                  selected?.type === "new" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Plus className="h-3 w-3 shrink-0" />
                New profile
              </button>
              <button
                onClick={() => setSelected({ type: "custom-measurables" })}
                className={`flex items-center gap-1.5 rounded py-1 text-xs transition-colors hover:text-foreground ${
                  selected?.type === "custom-measurables" ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <Settings2 className="h-3 w-3 shrink-0" />
                Custom measurables
              </button>
            </div>
          </div>

          {/* Right column: editor / manager / empty state */}
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {selected === null && (
              <p className="text-xs text-muted-foreground">
                Select a profile from the list to edit it, or create a new one.
              </p>
            )}

            {(selected?.type === "new" || selected?.type === "profile") && (
              <SchemeProfileEditor
                key={selected.type === "profile" ? selected.id : "new"}
                profileId={selected.type === "profile" ? selected.id : null}
                profileName={selected.type === "profile" ? selected.name : undefined}
                profilePosition={selected.type === "profile" ? selected.position : undefined}
                profileSchemeTag={selected.type === "profile" ? selected.schemeTag : undefined}
                onSaved={() => {
                  loadProfiles();
                  setSelected(null);
                }}
              />
            )}

            {selected?.type === "custom-measurables" && (
              <CustomMeasurablesManager />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
