"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Plus, Pencil, Settings2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSchemeProfiles, deleteSchemeProfile } from "@/app/actions/scheme-profiles";
import { SchemeProfileEditor } from "@/components/board/scheme-profile-editor";
import { CustomMeasurablesManager } from "@/components/board/custom-measurables-manager";

type View =
  | { type: "list" }
  | { type: "editor"; profileId: string | null; name?: string; position?: string | null; schemeTag?: string | null }
  | { type: "custom-measurables" };

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
  const [view, setView] = useState<View>({ type: "list" });
  const [profiles, setProfiles] = useState<SchemeProfile[]>([]);
  const [pending, startTransition] = useTransition();

  function loadProfiles() {
    startTransition(async () => {
      const data = await getSchemeProfiles();
      setProfiles(data as SchemeProfile[]);
    });
  }

  useEffect(() => {
    if (open) {
      loadProfiles();
      setView({ type: "list" });
    }
  }, [open]);

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSchemeProfile(id);
      loadProfiles();
    });
  }

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
        className={`fixed right-0 top-0 z-40 flex h-full w-[420px] flex-col bg-background shadow-2xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="text-sm font-semibold text-foreground">Scheme Profiles</span>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {view.type === "list" && (
            <div className="flex flex-col gap-4">
              {profiles.length === 0 && !pending && (
                <p className="text-xs text-muted-foreground">
                  No profiles yet. Create one to define your ideal player for each position and scheme.
                </p>
              )}

              {profiles.length > 0 && (
                <div className="flex flex-col divide-y divide-border rounded-sm border border-border">
                  {profiles.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          {p.position && <span>{p.position}</span>}
                          {p.position && p.scheme_tag && <span>·</span>}
                          {p.scheme_tag && <span>{p.scheme_tag}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setView({
                            type: "editor",
                            profileId: p.id,
                            name: p.name ?? undefined,
                            position: p.position,
                            schemeTag: p.scheme_tag,
                          })
                        }
                        className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                        title="Edit profile"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setView({ type: "editor", profileId: null })}
              >
                <Plus className="h-3.5 w-3.5" />
                New profile
              </Button>

              <button
                onClick={() => setView({ type: "custom-measurables" })}
                className="flex items-center justify-between rounded-sm border border-border px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
              >
                <span className="flex items-center gap-2">
                  <Settings2 className="h-3.5 w-3.5" />
                  Custom measurables
                </span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {view.type === "editor" && (
            <SchemeProfileEditor
              profileId={view.profileId}
              profileName={view.name}
              profilePosition={view.position}
              profileSchemeTag={view.schemeTag}
              onBack={() => setView({ type: "list" })}
              onSaved={() => { loadProfiles(); setView({ type: "list" }); }}
            />
          )}

          {view.type === "custom-measurables" && (
            <CustomMeasurablesManager onBack={() => setView({ type: "list" })} />
          )}
        </div>
      </div>
    </>
  );
}
