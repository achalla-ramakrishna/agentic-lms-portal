// Competency 10's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 24) — the levers that actually cut
// an agent's token bill, grouped by what they save: fewer input tokens,
// smarter dispatch (which model does what), fewer output tokens. The
// booklet sizes each card by its real share of $ saved; here every card
// in a column is equal height instead, since that number isn't something
// this app can verify — same "don't fabricate precision" discipline as
// the rest of this refresh.
const INPUT_ITEMS = [
  { title: "Graphify", description: "Index your codebase so agents skip re-reads" },
  { title: "Rust Token Killer", description: "Compress noisy command output" },
  { title: "Lean inputs", description: "Feed snippets, paths, MD docs, not whole files, sites" },
  { title: "Context hygiene", description: "Compact mid-session, restart for new work" },
];

const DISPATCH_ITEMS = [
  { title: "Smart model choices", description: "Plan with frontier models, code with efficient ones" },
  { title: "Sub-agents", description: "Offload research; return tight summaries" },
];

export function TokenSavingsDiagram() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-3">
          {INPUT_ITEMS.map((item) => (
            <SavingsCard key={item.title} {...item} color="success" />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {DISPATCH_ITEMS.map((item) => (
            <SavingsCard key={item.title} {...item} color="done" tall />
          ))}
        </div>
        <div className="flex flex-1">
          <SavingsCard
            title="Ponytail Skill"
            description="Avoid over-engineering to cut output tokens"
            color="danger"
            fill
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap gap-4">
          <Legend color="success" label="Fewer input tokens" />
          <Legend color="done" label="Smarter dispatch" />
          <Legend color="danger" label="Fewer output tokens" />
        </div>
        <span className="text-fg-subtle">
          Real savings vary by task; this shows the shape of the strategy, not
          measured $ figures.
        </span>
      </div>
    </div>
  );
}

const COLOR_CLASS: Record<string, { border: string; text: string; dot: string }> = {
  success: { border: "border-success-fg/50", text: "text-success-fg", dot: "bg-success-fg" },
  done: { border: "border-done-fg/50", text: "text-done-fg", dot: "bg-done-fg" },
  danger: { border: "border-danger-fg/50", text: "text-danger-fg", dot: "bg-danger-fg" },
};

function SavingsCard({
  title,
  description,
  color,
  tall,
  fill,
}: {
  title: string;
  description: string;
  color: "success" | "done" | "danger";
  tall?: boolean;
  fill?: boolean;
}) {
  const c = COLOR_CLASS[color];
  return (
    <div
      className={`rounded-lg border-2 bg-canvas-subtle p-3 ${c.border} ${
        fill ? "flex w-full flex-col justify-center" : tall ? "py-5" : ""
      }`}
    >
      <p className={`text-sm font-bold ${c.text}`}>{title}</p>
      <p className="mt-1 text-xs text-fg-muted">{description}</p>
    </div>
  );
}

function Legend({ color, label }: { color: "success" | "done" | "danger"; label: string }) {
  const c = COLOR_CLASS[color];
  return (
    <span className="flex items-center gap-1.5 text-fg-muted">
      <span className={`h-2 w-2 rounded-full ${c.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
