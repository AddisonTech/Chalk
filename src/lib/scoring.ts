export const STANDARD_MEASURABLE_KEYS = [
  "height",
  "weight",
  "forty_yard",
  "vertical",
  "shuttle",
  "broad_jump",
  "bench_reps",
  "film_grade",
  "athleticism_grade",
  "technique_grade",
  "football_iq_grade",
] as const;

export type StandardMeasurableKey = (typeof STANDARD_MEASURABLE_KEYS)[number];

export const STANDARD_MEASURABLE_LABELS: Record<StandardMeasurableKey, string> = {
  height: "Height",
  weight: "Weight",
  forty_yard: "40-Yard Dash",
  vertical: "Vertical",
  shuttle: "Shuttle",
  broad_jump: "Broad Jump",
  bench_reps: "Bench Reps",
  film_grade: "Film Grade",
  athleticism_grade: "Athleticism Grade",
  technique_grade: "Technique Grade",
  football_iq_grade: "Football IQ Grade",
};

export type Importance = "critical" | "nice_to_have" | "ignore";

export interface MeasurableConfig {
  key: string;
  label: string;
  importance: Importance;
  target: number | null;
  rangeMin: number | null;
  rangeMax: number | null;
  isCustom?: boolean;
}

export interface MeasurableBreakdownRow {
  key: string;
  label: string;
  importance: Importance;
  recruitValue: number | null;
  target: number | null;
  rangeMin: number | null;
  rangeMax: number | null;
  score: number | null;
  missingCritical: boolean;
}

export interface ScoreResult {
  score: number;
  breakdown: MeasurableBreakdownRow[];
  missingCriticalCount: number;
}

export function parseHeightToInches(h: string | null | undefined): number | null {
  if (!h) return null;
  const m = h.match(/(\d+)'?\s*(\d+)?[""]?/);
  if (!m) return null;
  const feet = parseInt(m[1], 10);
  const inches = m[2] ? parseInt(m[2], 10) : 0;
  return feet * 12 + inches;
}

export function scoreOneMeasurable(
  value: number,
  target: number,
  rangeMin: number | null,
  rangeMax: number | null,
): number {
  const halfWidth = (() => {
    if (rangeMin != null && rangeMax != null) return (rangeMax - rangeMin) / 2;
    if (rangeMin != null) return Math.abs(target - rangeMin);
    if (rangeMax != null) return Math.abs(rangeMax - target);
    return Math.abs(target) * 0.2 || 10;
  })();

  if (halfWidth <= 0) return value === target ? 100 : 0;

  const dist = Math.abs(value - target);
  return Math.max(0, 100 - 50 * (dist / halfWidth));
}

export function computeSchemeScore(
  configs: MeasurableConfig[],
  getRecruitValue: (key: string) => number | null,
): ScoreResult {
  let weightedSum = 0;
  let totalWeight = 0;
  let missingCriticalCount = 0;
  const breakdown: MeasurableBreakdownRow[] = [];

  for (const cfg of configs) {
    if (cfg.importance === "ignore") {
      breakdown.push({
        key: cfg.key,
        label: cfg.label,
        importance: cfg.importance,
        recruitValue: getRecruitValue(cfg.key),
        target: cfg.target,
        rangeMin: cfg.rangeMin,
        rangeMax: cfg.rangeMax,
        score: null,
        missingCritical: false,
      });
      continue;
    }

    const weight = cfg.importance === "critical" ? 2 : 1;
    const recruitValue = getRecruitValue(cfg.key);
    const hasConfig = cfg.target != null;
    const hasValue = recruitValue != null;

    let score: number | null = null;
    let missingCritical = false;

    if (!hasConfig) {
      breakdown.push({
        key: cfg.key,
        label: cfg.label,
        importance: cfg.importance,
        recruitValue,
        target: cfg.target,
        rangeMin: cfg.rangeMin,
        rangeMax: cfg.rangeMax,
        score: null,
        missingCritical: false,
      });
      continue;
    }

    if (!hasValue) {
      if (cfg.importance === "critical") missingCritical = true;
      missingCriticalCount += missingCritical ? 1 : 0;
      breakdown.push({
        key: cfg.key,
        label: cfg.label,
        importance: cfg.importance,
        recruitValue: null,
        target: cfg.target,
        rangeMin: cfg.rangeMin,
        rangeMax: cfg.rangeMax,
        score: null,
        missingCritical,
      });
      continue;
    }

    score = scoreOneMeasurable(recruitValue, cfg.target!, cfg.rangeMin, cfg.rangeMax);
    weightedSum += score * weight;
    totalWeight += weight;

    breakdown.push({
      key: cfg.key,
      label: cfg.label,
      importance: cfg.importance,
      recruitValue,
      target: cfg.target,
      rangeMin: cfg.rangeMin,
      rangeMax: cfg.rangeMax,
      score,
      missingCritical: false,
    });
  }

  const finalScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

  return {
    score: finalScore,
    breakdown,
    missingCriticalCount,
  };
}
