import type { SubmissionStatus } from "@prisma/client";
import { STATUS_LABEL, STATUS_FILL_CLASS } from "@/lib/submissions";
import type { StatusCounts } from "@/lib/dashboard-stats";

// Part-to-whole across all 35 exercises, by status. A stacked bar with a
// legend (dataviz skill: "part-to-whole -> stacked bar, categorical
// color" — here the categories are this app's fixed status colors, not a
// generic palette). rounded-full + overflow-hidden on the track gives
// rounded true data-ends with square internal joins for free; divide-x
// is the 2px surface-color gap between segments. Zero-count statuses are
// dropped from both the bar and the legend — an empty segment isn't data.
//
// Ran these hexes (ADR 0003, already shipped in every StatusBadge) through
// the dataviz skill's validator in this actual render order: CVD
// separation passes clean (worst adjacent ΔE 26.6). It flags "lightness
// band" — these run a touch brighter than the skill's ideal dark-mode
// fill ramp — but that's this app's established, ADR-documented status
// palette used everywhere else as text/border, not something to
// redesign for one chart. The gap between segments + direct legend
// labels + counts are the secondary encoding either way.
const STATUS_ORDER: SubmissionStatus[] = [
  "passed",
  "submitted",
  "needs_rework",
  "in_progress",
  "not_started",
];

export function StatusBar({ counts }: { counts: StatusCounts }) {
  const total = STATUS_ORDER.reduce((sum, s) => sum + counts[s], 0);
  const segments = STATUS_ORDER.filter((s) => counts[s] > 0);

  if (total === 0) return null;

  return (
    <div>
      <div className="flex h-5 divide-x-2 divide-canvas overflow-hidden rounded-full">
        {segments.map((status) => (
          <div
            key={status}
            className={STATUS_FILL_CLASS[status]}
            style={{ width: `${(counts[status] / total) * 100}%` }}
            title={`${STATUS_LABEL[status]}: ${counts[status]}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {segments.map((status) => (
          <span key={status} className="flex items-center gap-1.5 text-xs text-fg-muted">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${STATUS_FILL_CLASS[status]}`}
              aria-hidden="true"
            />
            {STATUS_LABEL[status]} <span className="text-fg">{counts[status]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
