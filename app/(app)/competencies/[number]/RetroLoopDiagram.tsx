// Competency 12's own concept diagram from the real guidebook booklet
// (agentic-engg.-booklet-v2.pdf, page 28) — the retrospective flywheel:
// Capture -> Analyze -> Draft the fix -> Approve -> Smarter next session,
// looping back to Capture, with "each turn compounds" at the center.
// Unlike every other diagram in this refresh, the booklet's own layout
// here is genuinely circular (a flywheel, not a line or a tree), so this
// is the one diagram that uses absolute-positioned nodes around a plain
// CSS circle instead of the stacked-card pattern used everywhere else —
// still no curved SVG connectors, just a bordered circle as the track.
const NODES: {
  number: number;
  label: string;
  subtitle: string;
  color: "accent" | "success" | "attention" | "danger" | "done";
  left: string;
  top: string;
}[] = [
  { number: 1, label: "Capture", subtitle: "hook records the trace", color: "accent", left: "50%", top: "6%" },
  { number: 2, label: "Analyze", subtitle: "agent reviews its own run", color: "success", left: "90%", top: "37%" },
  { number: 3, label: "Draft the fix", subtitle: "rule · skill · hook", color: "attention", left: "75%", top: "84%" },
  { number: 4, label: "Approve", subtitle: "you merge it", color: "danger", left: "25%", top: "84%" },
  { number: 5, label: "Smarter", subtitle: "next session", color: "done", left: "10%", top: "37%" },
];

const COLOR_CLASS: Record<string, { badge: string; text: string }> = {
  accent: { badge: "bg-accent", text: "text-accent" },
  success: { badge: "bg-success-fg", text: "text-success-fg" },
  attention: { badge: "bg-attention-fg", text: "text-attention-fg" },
  danger: { badge: "bg-danger-fg", text: "text-danger-fg" },
  done: { badge: "bg-done-fg", text: "text-done-fg" },
};

export function RetroLoopDiagram() {
  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-md">
        <div className="absolute inset-[16%] rounded-full border-2 border-dashed border-line" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-sm font-bold text-fg">each turn</p>
          <p className="text-sm font-bold text-fg">compounds</p>
        </div>

        {NODES.map((node) => {
          const c = COLOR_CLASS[node.color];
          return (
            <div
              key={node.number}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center"
              style={{ left: node.left, top: node.top }}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${c.badge}`}
              >
                {node.number}
              </span>
              <span className={`mt-1 text-sm font-bold ${c.text}`}>{node.label}</span>
              <span className="text-[10px] text-fg-muted">{node.subtitle}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-center text-xs text-fg-subtle">
        The pattern is the signal, not the model. The same mistake stops
        recurring — without you filing it each time.
      </p>
    </div>
  );
}
