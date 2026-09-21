// Competency 11's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 26) — the 4-step refactor loop
// (Characterize -> Change -> Verify -> Commit), repeated each pass while
// the safety net stays green, plus the "tests are the contract" callout.
// Same "no fragile SVG line art" approach: plain arrow characters between
// cards instead of a curved return-path SVG for the repeat loop.
const STEPS: {
  number: number;
  label: string;
  subtitle: string;
  color: "accent" | "success" | "attention" | "done";
}[] = [
  { number: 1, label: "Characterize", subtitle: "pin behavior with tests first", color: "accent" },
  { number: 2, label: "Change", subtitle: "small, reversible edits", color: "success" },
  { number: 3, label: "Verify", subtitle: "re-run the safety net", color: "attention" },
  { number: 4, label: "Commit", subtitle: "merge and iterate", color: "done" },
];

const COLOR_CLASS: Record<string, { border: string; badge: string }> = {
  accent: { border: "border-accent/60", badge: "bg-accent" },
  success: { border: "border-success-fg/60", badge: "bg-success-fg" },
  attention: { border: "border-attention-fg/60", badge: "bg-attention-fg" },
  done: { border: "border-done-fg/60", badge: "bg-done-fg" },
};

export function RefactorLoopDiagram() {
  return (
    <div>
      <div className="flex flex-col items-center gap-2 sm:flex-row">
        {STEPS.map((step, i) => {
          const c = COLOR_CLASS[step.color];
          return (
            <div key={step.number} className="flex items-center gap-2">
              <div className={`w-40 rounded-lg border-2 bg-canvas-subtle p-3 ${c.border}`}>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${c.badge}`}
                >
                  {step.number}
                </span>
                <p className="mt-2 text-sm font-bold text-fg">{step.label}</p>
                <p className="mt-0.5 text-xs text-fg-muted">{step.subtitle}</p>
              </div>
              {i < STEPS.length - 1 && (
                <span className="text-fg-subtle" aria-hidden="true">
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-center text-xs text-fg-subtle">
        <span aria-hidden="true">↺</span> repeat — each pass stays green
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-success-fg/40 bg-success-fg/10 p-4">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-fg text-sm"
          aria-hidden="true"
        >
          🧪
        </span>
        <div>
          <p className="text-sm font-bold text-success-fg">Tests are the contract</p>
          <p className="mt-1 text-xs text-success-fg/90">
            Characterization tests freeze observable behavior. Change the
            structure only while that contract stays green.
          </p>
        </div>
      </div>
    </div>
  );
}
