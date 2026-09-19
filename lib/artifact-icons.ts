// Classifies a toolkit tag (e.g. "AGENTS.md", "/plan", "Playwright") into
// one of a small set of artifact *types* so the same kind of thing always
// gets the same icon everywhere it's shown — not a bespoke icon per tag
// (which would be arbitrary for one-off proper nouns like "Treehouse" or
// "Graphify" and impossible to keep consistent as content grows), but a
// consistent type system, checked against every toolkit tag currently in
// content/seed.json (50 unique tags across all 12 competencies).
export type ArtifactCategory =
  | "doc"
  | "command"
  | "cli"
  | "guardrail"
  | "test"
  | "skill"
  | "agent"
  | "diagram"
  | "review"
  | "metric"
  | "spec";

export const ARTIFACT_ICON: Record<ArtifactCategory, string> = {
  doc: "📄",
  command: "⌨️",
  cli: "💻",
  guardrail: "🛡️",
  test: "🧪",
  skill: "🧩",
  agent: "👥",
  diagram: "🗺️",
  review: "🔀",
  metric: "📊",
  spec: "📋",
};

// Proper nouns with no generic keyword to match on.
const EXACT_OVERRIDES: Record<string, ArtifactCategory> = {
  mergemitra: "review",
  graphify: "metric",
  treehouse: "agent",
  "strangler pattern": "guardrail", // a safe-migration technique, same spirit as feature flags
  c4: "diagram",
  ears: "spec",
};

// Order matters: more specific/exclusive checks first, so e.g. "excalidraw
// skill" resolves to diagram (a diagramming tool) rather than the generic
// skill bucket, and "/review" resolves to command (it's a slash command
// first) rather than the review bucket its name suggests.
export function artifactCategory(tag: string): ArtifactCategory {
  const t = tag.toLowerCase().trim();

  if (EXACT_OVERRIDES[t]) return EXACT_OVERRIDES[t];
  if (t.startsWith("/")) return "command";
  if (t.includes("trace viewer")) return "test";
  if (
    t.includes("hook") ||
    t.includes("sandbox") ||
    t.includes("secret scanning") ||
    t.includes("flag")
  )
    return "guardrail";
  if (
    t.includes("mermaid") ||
    t.includes("adr") ||
    t.includes("architecture") ||
    t.includes("excalidraw") ||
    t.includes("repo-map")
  )
    return "diagram";
  if (t.includes("skill")) return "skill";
  if (t.includes("cli")) return "cli";
  if (
    t.includes("pr template") ||
    t.includes("ci artifact") ||
    t.includes("coverage")
  )
    return "review";
  if (
    t.includes("test") ||
    t.includes("mock") ||
    t.includes("locator") ||
    t.includes("playwright") ||
    t.includes("verify")
  )
    return "test";
  if (
    t.includes("worktree") ||
    t.includes("subagent") ||
    t.includes("agent team")
  )
    return "agent";
  if (
    t.includes("log") ||
    t.includes("trace") ||
    t.includes("compact") ||
    t.includes("usage")
  )
    return "metric";
  if (
    t.includes("spec") ||
    t.includes("acceptance") ||
    t.includes("given/when/then")
  )
    return "spec";

  return "doc"; // .md files and anything else fall through here
}
