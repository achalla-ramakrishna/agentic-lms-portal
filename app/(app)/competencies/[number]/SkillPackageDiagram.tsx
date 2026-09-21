// Competency 05's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 14) — a skill's folder anatomy:
// SKILL.md as the required root, branching into its 6 real parts (front
// matter, instructions, references/, scripts/, assets/, evals/). Same
// "no fragile SVG line art" approach as the other diagrams: a root card,
// a simple down connector (matching AgentCoreDiagram's Connector), and a
// column of small dashed connectors between each top/bottom card pair
// instead of a literal branching tree line.
const CHILDREN: {
  label: string;
  description: string;
  color: "accent" | "done" | "success" | "attention" | "danger";
}[] = [
  {
    label: "Front Matter",
    description: "name, description, and activation trigger",
    color: "accent",
  },
  {
    label: "Instructions",
    description: "workflow steps, rules, examples, validation loop",
    color: "done",
  },
  {
    label: "references/",
    description: "deeper docs, checklists, domain rules, reusable guidance",
    color: "success",
  },
  {
    label: "scripts/",
    description: "validators, generators, formatters, repeatable commands",
    color: "attention",
  },
  {
    label: "assets/",
    description: "templates, examples, starter files, images, structured forms",
    color: "danger",
  },
  {
    label: "evals/",
    description: "test prompts and expected outputs that prove the skill improves",
    color: "accent",
  },
];

const COLOR_CLASS: Record<string, { border: string; text: string }> = {
  accent: { border: "border-accent/60", text: "text-accent" },
  done: { border: "border-done-fg/60", text: "text-done-fg" },
  success: { border: "border-success-fg/60", text: "text-success-fg" },
  attention: { border: "border-attention-fg/60", text: "text-attention-fg" },
  danger: { border: "border-danger-fg/60", text: "text-danger-fg" },
};

export function SkillPackageDiagram() {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-xl border-2 border-danger-fg bg-danger-fg px-8 py-3 text-center text-white">
        <span className="block text-[10px] font-semibold uppercase tracking-wide opacity-90">
          Required root
        </span>
        <span className="block text-lg font-bold">SKILL.md</span>
        <span className="block text-xs opacity-90">
          metadata + instructions loaded only when relevant
        </span>
      </div>

      <span className="my-2 text-lg text-fg-subtle" aria-hidden="true">
        ↓
      </span>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((col) => {
          const top = CHILDREN[col];
          const bottom = CHILDREN[col + 3];
          const topStyle = COLOR_CLASS[top.color];
          const bottomStyle = COLOR_CLASS[bottom.color];
          return (
            <div key={top.label} className="flex flex-col items-center gap-1.5">
              <SkillCard {...top} className={`${topStyle.border} ${topStyle.text}`} />
              <span
                className="h-3 w-px border-l border-dashed border-fg-subtle"
                aria-hidden="true"
              />
              <SkillCard {...bottom} className={`${bottomStyle.border} ${bottomStyle.text}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillCard({
  label,
  description,
  className,
}: {
  label: string;
  description: string;
  className: string;
}) {
  return (
    <div className={`w-full rounded-lg border-2 bg-canvas-subtle p-3 ${className}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-0.5 text-xs text-fg-muted">{description}</p>
    </div>
  );
}
