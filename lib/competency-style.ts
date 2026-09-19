// One source of truth for the per-competency color/icon accents used on
// the landing page's sticky-note cards and, more subtly, throughout the
// authenticated app (sidebar dots, dashboard/competency card accents) —
// same competency always reads the same color everywhere, same pattern
// as lib/submissions.ts's STATUS_BADGE_CLASS.
export const COMPETENCY_ICON: Record<number, string> = {
  1: "🔧",
  2: "📋",
  3: "🧠",
  4: "✅",
  5: "📦",
  6: "🔀",
  7: "📖",
  8: "📎",
  9: "🔍",
  10: "💰",
  11: "♻️",
  12: "🔁",
};

const PALETTE = [
  { bg: "#eaf7ec", border: "#86c98f", text: "#1f6d33" },
  { bg: "#fbeaea", border: "#e28b8b", text: "#8a2e2e" },
  { bg: "#fbf3d9", border: "#d9b93f", text: "#7a5b00" },
  { bg: "#efeafb", border: "#b39ddb", text: "#4a2e8a" },
  { bg: "#e7f3fb", border: "#8fc6e8", text: "#1d5a85" },
  { bg: "#fbe9f2", border: "#e28bbf", text: "#8a2e63" },
];

export function competencyStyle(number: number) {
  return PALETTE[(number - 1) % PALETTE.length];
}
