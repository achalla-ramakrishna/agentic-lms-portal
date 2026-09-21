// Competency 08's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 20) — the "evidence ladder": five
// ascending gates (pre-commit -> pre-push -> PR -> CI/CD -> release), each
// producing its own evidence artifact. The booklet staggers the evidence
// callouts diagonally above a staircase; here each callout sits directly
// above its own step in a plain column, same "no fragile line art"
// approach as every other diagram in this app.
const STEPS: {
  number: string;
  label: string;
  subtitle: string;
  evidence: string;
  height: string;
  color: "accent" | "success" | "attention" | "done" | "danger";
}[] = [
  {
    number: "01",
    label: "Pre-commit",
    subtitle: "format · lint · unit",
    evidence: "git hooks output",
    height: "h-28",
    color: "accent",
  },
  {
    number: "02",
    label: "Pre-push",
    subtitle: "changed paths tested",
    evidence: "test matrix",
    height: "h-36",
    color: "success",
  },
  {
    number: "03",
    label: "Pull request",
    subtitle: "intent match · risk notes",
    evidence: "PR checklist",
    height: "h-44",
    color: "attention",
  },
  {
    number: "04",
    label: "CI / CD",
    subtitle: "build + scans clean",
    evidence: "sonar scans URL",
    height: "h-52",
    color: "done",
  },
  {
    number: "05",
    label: "Release",
    subtitle: "owner · rollback",
    evidence: "release log",
    height: "h-60",
    color: "danger",
  },
];

const COLOR_CLASS: Record<string, { bg: string; border: string; text: string }> = {
  accent: { bg: "bg-accent", border: "border-accent/60", text: "text-accent" },
  success: { bg: "bg-success-fg", border: "border-success-fg/60", text: "text-success-fg" },
  attention: {
    bg: "bg-attention-fg",
    border: "border-attention-fg/60",
    text: "text-attention-fg",
  },
  done: { bg: "bg-done-fg", border: "border-done-fg/60", text: "text-done-fg" },
  danger: { bg: "bg-danger-fg", border: "border-danger-fg/60", text: "text-danger-fg" },
};

export function EvidenceLadderDiagram() {
  return (
    <div className="flex items-end gap-3">
      {STEPS.map((step) => {
        const c = COLOR_CLASS[step.color];
        return (
          <div key={step.number} className="flex flex-1 flex-col items-center">
            <div
              className={`w-full rounded-md border border-dashed bg-canvas-subtle px-2 py-1.5 text-center ${c.border}`}
            >
              <span className={`block text-[9px] font-bold uppercase tracking-wide ${c.text}`}>
                Evidence
              </span>
              <span className="block text-[10px] text-fg-muted">{step.evidence}</span>
            </div>
            <span
              className={`my-1 h-3 w-px border-l border-dashed ${c.border}`}
              aria-hidden="true"
            />
            <div
              className={`flex w-full flex-col justify-end rounded-t-lg px-3 pb-2 pt-3 text-white ${c.bg} ${step.height}`}
            >
              <span className="text-xl font-bold">{step.number}</span>
              <p className="text-xs font-bold uppercase tracking-wide">{step.label}</p>
              <p className="text-[10px] opacity-90">{step.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
