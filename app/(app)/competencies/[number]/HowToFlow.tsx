// Renders an exercise's ordered howToSteps as a connected vertical flow
// (numbered node -> connector -> next node) instead of a plain <ol> —
// inspired by activity-diagram step boxes, simplified to a straight line
// since the underlying steps are genuinely sequential, not branching.
export function HowToFlow({ steps }: { steps: string[] }) {
  if (steps.length === 0) {
    return (
      <p className="text-sm text-fg-subtle">
        No steps listed for this exercise.
      </p>
    );
  }

  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={i} className="relative flex gap-4 pb-5 last:pb-0">
          <div className="flex flex-col items-center">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-canvas text-xs font-bold text-accent">
              {i + 1}
            </span>
            {i < steps.length - 1 && (
              <span
                className="mt-1 w-px flex-1 bg-line"
                aria-hidden="true"
              />
            )}
          </div>
          <p className="pt-0.5 text-sm leading-relaxed text-fg">{step}</p>
        </li>
      ))}
    </ol>
  );
}
