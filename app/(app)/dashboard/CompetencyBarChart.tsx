import { competencyStyle } from "@/lib/competency-style";

type CompetencyBarData = { number: number; title: string; passed: number; total: number };

// "Compare magnitude across categories" (dataviz skill's choosing-a-form
// table) — a horizontal bar per competency, kept in curriculum order
// (01→12) rather than sorted by value, since a learner reads this by
// "how is competency N doing," not by rank. Each bar uses that
// competency's own established color (competencyStyle, same hues as the
// sidebar/cards/landing page) rather than a fresh categorical palette —
// identity here rides the direct label, not color-matching between bars.
export function CompetencyBarChart({
  competencies,
}: {
  competencies: CompetencyBarData[];
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {competencies.map((c) => {
        const palette = competencyStyle(c.number);
        const pct = c.total === 0 ? 0 : Math.round((c.passed / c.total) * 100);
        return (
          <div key={c.number} className="flex items-center gap-3">
            <span className="w-44 shrink-0 truncate text-xs text-fg-muted">
              <span className="font-mono text-fg-subtle">
                {String(c.number).padStart(2, "0")}
              </span>{" "}
              {c.title}
            </span>
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-canvas-inset">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${pct}%`, backgroundColor: palette.border }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-xs font-semibold text-fg">
              {c.passed}/{c.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}
