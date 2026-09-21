// Competency 06's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 16) — three independent tasks
// branching off "main" into their own worktree/branch, each becoming its
// own PR, converging on one review-and-merge point. The booklet draws
// this as a curved git-graph; here it's three plain lanes (a colored line
// on each side of a card) rather than fragile curved SVG paths, same
// approach as every other diagram in this app.
const LANES: {
  title: string;
  detail: string;
  color: "accent" | "success" | "attention";
}[] = [
  {
    title: "Workflow Test automation",
    detail: "worktree wt/e2e · branch qa/e2e",
    color: "accent",
  },
  {
    title: "Report creation",
    detail: "worktree wt/report · branch docs/report",
    color: "success",
  },
  {
    title: "Add RBAC",
    detail: "worktree wt/rbac · branch feat/rbac",
    color: "attention",
  },
];

const COLOR_CLASS: Record<string, { border: string; text: string; bg: string; line: string }> = {
  accent: { border: "border-accent/60", text: "text-accent", bg: "bg-accent/10", line: "bg-accent/60" },
  success: {
    border: "border-success-fg/60",
    text: "text-success-fg",
    bg: "bg-success-fg/10",
    line: "bg-success-fg/60",
  },
  attention: {
    border: "border-attention-fg/60",
    text: "text-attention-fg",
    bg: "bg-attention-fg/10",
    line: "bg-attention-fg/60",
  },
};

export function ParallelLanesDiagram() {
  return (
    <div>
      <div className="flex items-stretch gap-3">
        <div className="flex shrink-0 flex-col items-center justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-fg" aria-hidden="true" />
          <span className="mt-1 text-xs font-semibold text-fg-muted">main</span>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {LANES.map((lane) => {
            const c = COLOR_CLASS[lane.color];
            return (
              <div key={lane.title} className="flex items-center gap-3">
                <span className={`h-0.5 flex-1 ${c.line}`} aria-hidden="true" />
                <div className={`w-64 shrink-0 rounded-lg border-2 p-3 ${c.border} ${c.bg}`}>
                  <p className={`text-sm font-semibold ${c.text}`}>{lane.title}</p>
                  <p className="mt-0.5 text-xs text-fg-muted">{lane.detail}</p>
                </div>
                <span className={`h-0.5 flex-1 ${c.line}`} aria-hidden="true" />
                <span className={`shrink-0 text-xs font-semibold ${c.text}`}>
                  its own PR →
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center text-center">
          <span className="h-2.5 w-2.5 rounded-full bg-fg" aria-hidden="true" />
          <span className="mt-1 w-16 text-xs font-semibold text-fg-muted">
            Review each, then merge
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border-2 border-danger-fg/50 bg-danger-fg/10 p-4">
          <div className="flex items-start gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger-fg text-sm"
              aria-hidden="true"
            >
              ⚠️
            </span>
            <div>
              <p className="text-sm font-bold text-danger-fg">Same files, two agents</p>
              <p className="mt-1 text-xs text-danger-fg/90">
                they overwrite each other — you spend the saved time fixing
                conflicts. <strong>Isolate first.</strong>
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border-2 border-success-fg/50 bg-success-fg/10 p-4">
          <div className="flex items-start gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success-fg text-sm"
              aria-hidden="true"
            >
              🌿
            </span>
            <div>
              <p className="text-sm font-bold text-success-fg">
                One complex task? Use subagents
              </p>
              <p className="mt-1 text-xs text-success-fg/90">
                explore sub-agents that <strong>return summaries</strong> — the
                main thread keeps the main task.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
