// Competency 03's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 10) — the "context layer" a project
// keeps ready for an agent before it starts a task: repo shape, decisions,
// conventions, and the commands that run it. The booklet renders these as
// a grid connected by dotted lines; here it's a plain card grid (same
// "no fragile SVG line art" approach as AgentCoreDiagram/
// SpecFramingDiagram) using the app's own named color tokens — green
// (success), blue (accent), orange (attention), purple (done) — rather
// than inventing new colors, matching the booklet's own color grouping.
const CARDS: {
  label: string;
  description: string;
  color: "success" | "accent" | "attention" | "done";
}[] = [
  { label: "Repo overview", description: "how it's shaped", color: "success" },
  { label: "Architecture", description: "module boundaries", color: "accent" },
  {
    label: "Conventions",
    description: "naming · patterns · folder structure",
    color: "attention",
  },
  { label: "Module map", description: "owners · entry points", color: "done" },
  { label: "Data flows · APIs", description: "contracts", color: "attention" },
  { label: "ADRs", description: "the \"why\"", color: "accent" },
  { label: "Commands", description: "build · test · run", color: "success" },
];

const COLOR_CLASS: Record<string, string> = {
  success: "border-success-fg/50 text-success-fg",
  accent: "border-accent/50 text-accent",
  attention: "border-attention-fg/50 text-attention-fg",
  done: "border-done-fg/50 text-done-fg",
};

export function ContextLayerDiagram() {
  return (
    <div className="rounded-xl border border-line bg-canvas-inset p-5">
      <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
        Context Layer
      </span>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {CARDS.slice(0, 6).map((card) => (
          <ContextCard key={card.label} {...card} />
        ))}
      </div>
      <div className="mt-3 flex justify-center">
        <div className="w-full sm:w-1/3">
          <ContextCard {...CARDS[6]} />
        </div>
      </div>
    </div>
  );
}

function ContextCard({
  label,
  description,
  color,
}: {
  label: string;
  description: string;
  color: "success" | "accent" | "attention" | "done";
}) {
  return (
    <div className={`rounded-lg border-2 bg-canvas-subtle p-3 ${COLOR_CLASS[color]}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-0.5 text-xs text-fg-muted">{description}</p>
    </div>
  );
}
