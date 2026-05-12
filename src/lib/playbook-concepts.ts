// Curated situational concepts used to generate game plan recommendations.
// Filtered by situation at plan creation time.

export interface Concept {
  id: string;
  situation: string;
  phase: "offense" | "defense" | "special_teams";
  name: string;
  description: string;
}

export const CONCEPTS: Concept[] = [
  // Offense - 3rd down
  {
    id: "o-3d-mesh",
    situation: "3rd_down",
    phase: "offense",
    name: "Mesh",
    description: "High-percentage crosser combination. Two receivers on crossing routes create natural pick; works against man or zone.",
  },
  {
    id: "o-3d-snag",
    situation: "3rd_down",
    phase: "offense",
    name: "Snag",
    description: "Triangle read: corner, flat, snag route. Stresses the flat defender; QB reads flat-corner off pre-snap alignment.",
  },
  {
    id: "o-3d-stick",
    situation: "3rd_down",
    phase: "offense",
    name: "Stick",
    description: "Short stick route to the field with curl-flat behind. Quick decision, take what the coverage gives.",
  },
  {
    id: "o-3d-4-verts",
    situation: "3rd_down",
    phase: "offense",
    name: "Four Verticals",
    description: "Stress the safeties on 3rd and long. Attack seam routes vs. Cover 2 or 3; hit the post vs. Cover 4.",
  },

  // Offense - Red zone
  {
    id: "o-rz-fade",
    situation: "red_zone",
    phase: "offense",
    name: "Fade/Back shoulder",
    description: "Back-shoulder fade to your best boundary receiver. Requires rehearsal but high-percentage in space.",
  },
  {
    id: "o-rz-trips-rpo",
    situation: "red_zone",
    phase: "offense",
    name: "Trips RPO",
    description: "Trips look with bubble or slip screen built in. Forces the defense to declare while the inside run threatens the gap.",
  },
  {
    id: "o-rz-power",
    situation: "red_zone",
    phase: "offense",
    name: "Power / Lead",
    description: "Gap scheme with lead blocker. Create a crease between the guards; finish with a north-south runner.",
  },
  {
    id: "o-rz-corner",
    situation: "red_zone",
    phase: "offense",
    name: "Corner route",
    description: "Corner route off play-action. Safety is drawn toward the run fake; hit the corner route in the back pylon.",
  },

  // Offense - 2-minute / two-minute drill
  {
    id: "o-2min-tempo",
    situation: "two_minute",
    phase: "offense",
    name: "Tempo package",
    description: "No-huddle spread. Get to the ball, get aligned, get the snap. Goal: 1 play per 12 seconds. Run clock only when needed.",
  },
  {
    id: "o-2min-sideline",
    situation: "two_minute",
    phase: "offense",
    name: "Sideline game",
    description: "Quick outs and stop routes to stop the clock. Take what is open; never take a sack.",
  },
  {
    id: "o-2min-middle",
    situation: "two_minute",
    phase: "offense",
    name: "Middle crossing",
    description: "Cross routes over the middle when timeouts are available. Yards after catch; get down or out of bounds.",
  },

  // Offense - opening script
  {
    id: "o-open-script",
    situation: "opening",
    phase: "offense",
    name: "Opening script",
    description: "Run 12-15 scripted plays to test every defensive look. Inside zone, outside zone, play-action, quick game, and a screen.",
  },
  {
    id: "o-open-motions",
    situation: "opening",
    phase: "offense",
    name: "Motion and shifts",
    description: "Use pre-snap motion and formation shifts to read defensive rotation. Identify man vs. zone and pressure tendencies early.",
  },

  // Defense - base calls
  {
    id: "d-base-cover2",
    situation: "base",
    phase: "defense",
    name: "Cover 2 shell",
    description: "Two-high shell to limit explosive plays. Force the offense to drive the field; rely on interior run fits and flat coverage.",
  },
  {
    id: "d-base-cover3",
    situation: "base",
    phase: "defense",
    name: "Cover 3 buzz",
    description: "Single-high with buzz safety to the field. Takes away the seam route; forces the QB to work against the corners.",
  },
  {
    id: "d-base-quarters",
    situation: "base",
    phase: "defense",
    name: "Quarters / Cover 4",
    description: "Four-deep quarters. Good against vertical routes; safeties play the #2 receiver vertical; corners on #1.",
  },

  // Defense - pressure
  {
    id: "d-pressure-tmoz",
    situation: "pressure",
    phase: "defense",
    name: "Tampa-2 zero",
    description: "Drop the MLB into a deep hole behind a two-high look, then spin to zero. Disguise the coverage until the snap.",
  },
  {
    id: "d-pressure-fire",
    situation: "pressure",
    phase: "defense",
    name: "Fire zone blitz",
    description: "Five-man pressure with three-under, three-deep behind. Bring an edge rusher off coverage to create a free runner.",
  },
  {
    id: "d-pressure-zero",
    situation: "pressure",
    phase: "defense",
    name: "Zero coverage",
    description: "Man coverage with no free safety. Use on 3rd and long when you need a sack or incompletion. High risk, high reward.",
  },

  // Defense - red zone
  {
    id: "d-rz-goal-line",
    situation: "red_zone",
    phase: "defense",
    name: "Goal line front",
    description: "Heavy box with an extra lineman. Stop the power run first. Eliminate the tight end as a receiver option.",
  },
  {
    id: "d-rz-palms",
    situation: "red_zone",
    phase: "defense",
    name: "Palms",
    description: "Quarters-based red zone coverage. Corners and safeties read the #2 receiver; takes away the corner route and seam.",
  },

  // Defense - 3rd down
  {
    id: "d-3d-speed",
    situation: "3rd_down",
    phase: "defense",
    name: "Speed rush package",
    description: "Bring your fastest edge rusher from a wide alignment. Force a quick throw or a sack; complement with a coverage shell that holds.",
  },
];

export function getConceptsBySituation(situation: string, phase?: "offense" | "defense") {
  return CONCEPTS.filter(
    (c) => c.situation === situation && (phase ? c.phase === phase : true),
  );
}
