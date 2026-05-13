"use client";

import { useState, useTransition, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  getProfileMeasurables,
  saveProfileMeasurables,
  createSchemeProfile,
  updateSchemeProfile,
} from "@/app/actions/scheme-profiles";
import { getCustomMeasurables } from "@/app/actions/custom-measurables";
import {
  STANDARD_MEASURABLE_KEYS,
  STANDARD_MEASURABLE_LABELS,
  type Importance,
} from "@/lib/scoring";

const POSITIONS = ["QB","RB","FB","WR","TE","OT","OG","C","DE","DT","ILB","OLB","CB","S","K","P","LS"];

interface MeasurableRow {
  key: string;
  label: string;
  isCustom: boolean;
  importance: Importance;
  target: string;
  rangeMin: string;
  rangeMax: string;
}

interface CustomMeasurable {
  id: string;
  name: string;
  unit: string | null;
}

interface Props {
  profileId: string | null;
  profileName?: string;
  profilePosition?: string | null;
  profileSchemeTag?: string | null;
  onBack?: () => void;
  onSaved: () => void;
}

function defaultRows(customMeasurables: CustomMeasurable[]): MeasurableRow[] {
  return [
    ...STANDARD_MEASURABLE_KEYS.map((k) => ({
      key: k,
      label: STANDARD_MEASURABLE_LABELS[k],
      isCustom: false,
      importance: "nice_to_have" as Importance,
      target: "",
      rangeMin: "",
      rangeMax: "",
    })),
    ...customMeasurables.map((m) => ({
      key: m.id,
      label: m.name + (m.unit ? ` (${m.unit})` : ""),
      isCustom: true,
      importance: "nice_to_have" as Importance,
      target: "",
      rangeMin: "",
      rangeMax: "",
    })),
  ];
}

export function SchemeProfileEditor({ profileId, profileName, profilePosition, profileSchemeTag, onBack, onSaved }: Props) {
  const [name, setName] = useState(profileName ?? "");
  const [position, setPosition] = useState(profilePosition ?? "");
  const [schemeTag, setSchemeTag] = useState(profileSchemeTag ?? "");
  const [rows, setRows] = useState<MeasurableRow[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      const [customMeasurables, existingConfigs] = await Promise.all([
        getCustomMeasurables(),
        profileId ? getProfileMeasurables(profileId) : Promise.resolve([]),
      ]);

      const base = defaultRows(customMeasurables as CustomMeasurable[]);

      if (existingConfigs.length > 0) {
        const configMap = new Map(
          (existingConfigs as Array<{
            measurable_key: string | null;
            custom_measurable_id: string | null;
            importance: string;
            target_value: number | null;
            range_min: number | null;
            range_max: number | null;
          }>).map((c) => [c.measurable_key ?? c.custom_measurable_id ?? "", c])
        );
        for (const row of base) {
          const cfg = configMap.get(row.key);
          if (cfg) {
            row.importance = cfg.importance as Importance;
            row.target = cfg.target_value?.toString() ?? "";
            row.rangeMin = cfg.range_min?.toString() ?? "";
            row.rangeMax = cfg.range_max?.toString() ?? "";
          }
        }
      }

      setRows(base);
    });
  }, [profileId]);

  function updateRow(key: string, field: keyof MeasurableRow, value: string) {
    setRows((prev) => prev.map((r) => r.key === key ? { ...r, [field]: value } : r));
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError("Profile name is required."); return; }

    startTransition(async () => {
      let pid = profileId;

      if (!pid) {
        const fd = new FormData();
        fd.set("name", name.trim());
        fd.set("position", position.trim());
        fd.set("scheme_tag", schemeTag.trim());
        const result = await createSchemeProfile(fd);
        if ("error" in result && result.error) { setError(result.error); return; }
        pid = (result as { profileId: string }).profileId;
      } else {
        const result = await updateSchemeProfile(pid, {
          name: name.trim(),
          position: position.trim() || null,
          scheme_tag: schemeTag.trim() || null,
        });
        if ("error" in result && result.error) { setError(result.error); return; }
      }

      const measurables = rows.map((r) => ({
        measurable_key: r.isCustom ? null : r.key,
        custom_measurable_id: r.isCustom ? r.key : null,
        importance: r.importance,
        target_value: r.target !== "" ? parseFloat(r.target) : null,
        range_min: r.rangeMin !== "" ? parseFloat(r.rangeMin) : null,
        range_max: r.rangeMax !== "" ? parseFloat(r.rangeMax) : null,
      }));

      const saveResult = await saveProfileMeasurables(pid!, measurables);
      if ("error" in saveResult && saveResult.error) { setError(saveResult.error); return; }

      onSaved();
    });
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to profiles
          </button>
        ) : <span />}
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {profileId ? "Edit Profile" : "New Profile"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1.5">
          <Label>Profile name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Cover 3 CB" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Position</Label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="h-10 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">Any</option>
            {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Scheme tag</Label>
          <Input value={schemeTag} onChange={(e) => setSchemeTag(e.target.value)} placeholder="Cover 3" />
        </div>
      </div>

      {rows.length > 0 && (
        <div className="flex flex-col gap-1">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Measurable weights</div>
          <div className="rounded-sm border border-border overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Measurable</th>
                  <th className="px-2 py-2 text-left font-medium text-muted-foreground">Importance</th>
                  <th className="px-2 py-2 text-left font-medium text-muted-foreground">Target</th>
                  <th className="px-2 py-2 text-left font-medium text-muted-foreground">Min</th>
                  <th className="px-2 py-2 text-left font-medium text-muted-foreground">Max</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-background">
                {rows.map((row) => (
                  <tr key={row.key} className={row.importance === "ignore" ? "opacity-40" : ""}>
                    <td className="px-3 py-2 text-foreground">{row.label}</td>
                    <td className="px-2 py-1.5">
                      <select
                        value={row.importance}
                        onChange={(e) => updateRow(row.key, "importance", e.target.value)}
                        className="h-7 w-full rounded border border-border-strong bg-surface px-1.5 text-xs text-foreground focus:border-accent focus:outline-none"
                      >
                        <option value="critical">Critical</option>
                        <option value="nice_to_have">Nice to have</option>
                        <option value="ignore">Ignore</option>
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        step="any"
                        value={row.target}
                        onChange={(e) => updateRow(row.key, "target", e.target.value)}
                        disabled={row.importance === "ignore"}
                        placeholder="-"
                        className="h-7 w-16 rounded border border-border-strong bg-surface px-1.5 text-xs text-foreground focus:border-accent focus:outline-none disabled:opacity-30"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        step="any"
                        value={row.rangeMin}
                        onChange={(e) => updateRow(row.key, "rangeMin", e.target.value)}
                        disabled={row.importance === "ignore"}
                        placeholder="-"
                        className="h-7 w-16 rounded border border-border-strong bg-surface px-1.5 text-xs text-foreground focus:border-accent focus:outline-none disabled:opacity-30"
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        type="number"
                        step="any"
                        value={row.rangeMax}
                        onChange={(e) => updateRow(row.key, "rangeMax", e.target.value)}
                        disabled={row.importance === "ignore"}
                        placeholder="-"
                        className="h-7 w-16 rounded border border-border-strong bg-surface px-1.5 text-xs text-foreground focus:border-accent focus:outline-none disabled:opacity-30"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex justify-end gap-2 pb-1">
        {onBack && (
          <Button type="button" variant="ghost" size="sm" onClick={onBack} disabled={pending}>Cancel</Button>
        )}
        <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving..." : "Save profile"}</Button>
      </div>
    </form>
  );
}
