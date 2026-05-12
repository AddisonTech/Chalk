// Generates deterministic fake tendency data from an opponent name.
// Same input always produces the same output - looks realistic without real play data.

function strHash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return Math.abs(h >>> 0);
}

function frac(seed: number, index: number): number {
  const x = Math.sin(seed + index * 7919) * 10000;
  return x - Math.floor(x);
}

function pick<T>(seed: number, index: number, arr: T[]): T {
  return arr[Math.floor(frac(seed, index) * arr.length)];
}

function pct(seed: number, index: number, min: number, max: number): number {
  return Math.round(min + frac(seed, index) * (max - min));
}

const FORMATIONS = ["Shotgun", "Pistol", "I-Form", "Spread", "Singleback", "Wildcat", "Empty", "Trips"];
const PERSONNEL = [
  { code: "11", label: "11 personnel (1 RB, 1 TE, 3 WR)" },
  { code: "12", label: "12 personnel (1 RB, 2 TE, 2 WR)" },
  { code: "21", label: "21 personnel (2 RB, 1 TE, 2 WR)" },
  { code: "10", label: "10 personnel (1 RB, 0 TE, 4 WR)" },
  { code: "22", label: "22 personnel (2 RB, 2 TE, 1 WR)" },
  { code: "13", label: "13 personnel (1 RB, 3 TE, 1 WR)" },
];

export interface TendencyReport {
  runPass: { run: number; pass: number };
  byDown: { down: number; run: number; pass: number }[];
  formations: { name: string; pct: number }[];
  personnel: { code: string; label: string; pct: number }[];
  situational: {
    label: string;
    run: number;
    pass: number;
    note: string;
  }[];
  insights: string[];
}

const RUN_NOTES = [
  "Heavy inside zone out of heavy sets.",
  "Inside zone with occasional toss sweep.",
  "Power and counter as primary run concepts.",
  "Zone read with QB carry option.",
  "Downhill gap scheme, lead blocker heavy.",
];

const PASS_NOTES = [
  "Vertical concepts off play-action.",
  "Quick game and screen heavy on 3rd down.",
  "Mesh and spacing concepts out of spread.",
  "RPO-heavy with bubble screens.",
  "Drop-back heavy, use of crossing routes.",
];

const INSIGHTS = [
  "Most explosive plays come on 1st down - they take shots early.",
  "Heavy screen game on 3rd and long, tend to avoid negative plays.",
  "Run game is most effective to the boundary side.",
  "Play-action success rate above average when run/pass balance is even.",
  "Motion pre-snap on roughly a third of plays - watch for formation shifts.",
  "Tendency to go no-huddle after scoring, tempo is a factor.",
  "Red zone packages shift to 12 personnel with more TE routes.",
  "QB is a run threat - contain discipline critical on perimeter.",
  "Gadget plays (reverses, jet sweeps) appear roughly once per half.",
  "Slow down on 3rd and short - QB sneak and QB draw are in their tool bag.",
];

export function generateTendency(opponentName: string): TendencyReport {
  const s = strHash(opponentName.toLowerCase());

  const overallRun = pct(s, 0, 38, 62);
  const overallPass = 100 - overallRun;

  // Down splits - vary each down around the overall tendency
  const byDown = [1, 2, 3, 4].map((down, i) => {
    const offset = pct(s, 10 + i, -14, 14);
    const run = Math.max(10, Math.min(90, overallRun + offset));
    return { down, run, pass: 100 - run };
  });

  // Top 3 formations
  const formationPool = [...FORMATIONS].sort(() => frac(s, 20) - 0.5);
  const f1 = pct(s, 30, 38, 58);
  const f2 = pct(s, 31, 18, 35);
  const f3 = Math.max(5, 100 - f1 - f2);
  const formations = [
    { name: formationPool[0], pct: f1 },
    { name: formationPool[1], pct: f2 },
    { name: formationPool[2], pct: f3 },
  ];

  // Top 2 personnel groupings
  const persPool = [...PERSONNEL].sort(() => frac(s, 40) - 0.5);
  const p1 = pct(s, 50, 45, 70);
  const p2 = Math.max(10, 100 - p1);
  const personnel = [
    { ...persPool[0], pct: p1 },
    { ...persPool[1], pct: p2 },
  ];

  // Situational splits
  const rzRun = pct(s, 60, 42, 65);
  const t3sRun = pct(s, 61, 55, 80);
  const t3lRun = pct(s, 62, 15, 35);
  const twoMinRun = pct(s, 63, 10, 28);

  const situational = [
    {
      label: "Red Zone",
      run: rzRun,
      pass: 100 - rzRun,
      note: pick(s, 70, RUN_NOTES),
    },
    {
      label: "3rd and Short (1-3)",
      run: t3sRun,
      pass: 100 - t3sRun,
      note: "Short yardage tendency leans heavily run.",
    },
    {
      label: "3rd and Long (7+)",
      run: t3lRun,
      pass: 100 - t3lRun,
      note: pick(s, 71, PASS_NOTES),
    },
    {
      label: "2-Minute Drill",
      run: twoMinRun,
      pass: 100 - twoMinRun,
      note: "Shifts to spread tempo, run game nearly disappears.",
    },
  ];

  // 3 unique insights
  const shuffled = [...INSIGHTS].sort(() => frac(s, 80) - 0.5);
  const insights = shuffled.slice(0, 3);

  return { runPass: { run: overallRun, pass: overallPass }, byDown, formations, personnel, situational, insights };
}
