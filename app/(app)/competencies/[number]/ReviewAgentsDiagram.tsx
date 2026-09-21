// Competency 09's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 22) — a root "specialized review
// agents" node fanning out into 4 review lenses (Correctness, NFR, Test
// Quality, Code Quality), each producing ranked findings, converging into
// a shared "review memory" the next review agent reuses. Same "no
// fragile SVG line art" approach as AgentCoreDiagram/SkillPackageDiagram:
// a root card, a simple down connector, a row of cards, then a converge
// connector into a bottom card.
const LENSES: {
  icon: string;
  label: string;
  description: string;
  color: "accent" | "danger" | "success" | "done";
}[] = [
  {
    icon: "✓",
    label: "Correctness",
    description: "Bugs across state, flows, contracts, and edge cases.",
    color: "accent",
  },
  {
    icon: "🛡️",
    label: "NFR",
    description: "Enterprise grade security, performance, reliability, accessibility.",
    color: "danger",
  },
  {
    icon: "🧪",
    label: "Test Quality",
    description: "Tests prove behavior, not implementation.",
    color: "success",
  },
  {
    icon: "</>",
    label: "Code Quality",
    description: "Naming, duplication, complexity, clean code, team conventions.",
    color: "done",
  },
];

const COLOR_CLASS: Record<string, { border: string; text: string }> = {
  accent: { border: "border-accent/60", text: "text-accent" },
  danger: { border: "border-danger-fg/60", text: "text-danger-fg" },
  success: { border: "border-success-fg/60", text: "text-success-fg" },
  done: { border: "border-done-fg/60", text: "text-done-fg" },
};

export function ReviewAgentsDiagram() {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3 rounded-xl border-2 border-done-fg bg-done-fg px-6 py-3 text-white">
        <span className="text-xl" aria-hidden="true">
          🤖
        </span>
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-90">
            Code Review
          </span>
          <span className="block text-sm font-bold">Specialized review agents</span>
        </div>
      </div>

      <span className="my-2 text-lg text-fg-subtle" aria-hidden="true">
        ↓
      </span>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-4">
        {LENSES.map((lens) => {
          const c = COLOR_CLASS[lens.color];
          return (
            <div key={lens.label} className={`rounded-lg border-2 bg-canvas-subtle p-3 ${c.border}`}>
              <p className={`flex items-center gap-1.5 text-sm font-bold ${c.text}`}>
                <span aria-hidden="true">{lens.icon}</span> {lens.label}
              </p>
              <p className="mt-1 text-xs text-fg">{lens.description}</p>
              <p className={`mt-2 text-[10px] font-semibold ${c.text}`}>● ranked findings</p>
            </div>
          );
        })}
      </div>

      <span className="my-2 text-lg text-fg-subtle" aria-hidden="true">
        ↓
      </span>

      <div className="w-full rounded-xl border-2 border-done-fg/50 bg-done-fg/10 p-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-done-fg text-sm"
            aria-hidden="true"
          >
            🔽
          </span>
          <div className="flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-done-fg">
              Memory
            </span>
            <p className="text-sm font-bold text-done-fg">Capture review memory</p>
            <p className="text-xs text-done-fg/80">
              guidance the next review agent can reuse
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "repo-level guidelines",
                "enterprise standards",
                "pattern memory",
                "anti-pattern memory",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-done-fg/40 bg-canvas px-2 py-0.5 text-[10px] text-done-fg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
