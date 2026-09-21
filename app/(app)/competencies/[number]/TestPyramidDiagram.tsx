// Competency 04's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 12) — the test pyramid as a vertical
// timeline (End-to-End -> Integration -> Unit Tests, numbered 3/2/1) plus a
// "Prove the coverage is real" pro-tip callout. Same "no fragile SVG line
// art" approach as the other diagrams: a plain connector line between
// numbered badges, built from this app's existing color tokens (accent,
// done, success, attention) to match the booklet's own color grouping.
const STEPS: {
  number: number;
  icon: string;
  label: string;
  subtitle: string;
  description: string;
  color: "accent" | "done" | "success";
}[] = [
  {
    number: 3,
    icon: "🚩",
    label: "End-to-End",
    subtitle: "Critical user journeys",
    description: "Validates the complete experience from end-user perspective.",
    color: "accent",
  },
  {
    number: 2,
    icon: "☁️",
    label: "Integration",
    subtitle: "Service contracts",
    description: "Verifies that services and components work together as expected.",
    color: "done",
  },
  {
    number: 1,
    icon: "🔷",
    label: "Unit Tests",
    subtitle: "Fast behavior checks",
    description: "Validates individual pieces of business logic quickly and reliably.",
    color: "success",
  },
];

const COLOR_CLASS: Record<string, { border: string; bg: string; text: string }> = {
  accent: { border: "border-accent/60", bg: "bg-accent/10", text: "text-accent" },
  done: { border: "border-done-fg/60", bg: "bg-done-fg/10", text: "text-done-fg" },
  success: {
    border: "border-success-fg/60",
    bg: "bg-success-fg/10",
    text: "text-success-fg",
  },
};

export function TestPyramidDiagram() {
  return (
    <div>
      <div className="flex flex-col">
        {STEPS.map((step, i) => {
          const c = COLOR_CLASS[step.color];
          return (
            <div key={step.label} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-canvas text-sm font-bold ${c.border} ${c.text}`}
                >
                  {step.number}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="w-px flex-1 bg-line" aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className={`rounded-xl border-2 p-4 ${c.border} ${c.bg}`}>
                  <p className={`text-sm font-bold ${c.text}`}>
                    <span aria-hidden="true">{step.icon}</span> {step.label}
                  </p>
                  <p className="mt-1 text-sm text-fg">
                    <strong>{step.subtitle}:</strong> {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border-2 border-attention-fg/50 bg-attention-fg/10 p-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-attention-fg text-base"
            aria-hidden="true"
          >
            💡
          </span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wide text-attention-fg">
              Pro Tip
            </span>
            <p className="text-sm font-bold text-attention-fg">Prove the coverage is real</p>
            <p className="mt-1 text-xs text-attention-fg/90">
              Mutation testing injects defects into key flows; the suite must
              catch them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
