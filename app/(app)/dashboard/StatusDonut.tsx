import type { SubmissionStatus } from "@prisma/client";
import { STATUS_LABEL, STATUS_FILL_CLASS } from "@/lib/submissions";
import type { StatusCounts } from "@/lib/dashboard-stats";

// Part-to-whole status breakdown as a donut (dataviz skill: donut/pie is
// legal for an "at a glance" part-to-whole read at <= 6 segments — bad
// only for comparing close values, which the direct-labeled legend
// already covers here). Same status order and hues as the app's
// STATUS_BADGE_CLASS everywhere else. Validated this exact circular
// order (including the wrap-around pair, not just adjacent-in-array) in
// dark mode against the dataviz skill's validator before shipping: CVD
// separation clean, the "lightness band" flag is this app's pre-existing
// status palette (ADR 0003), not something to redesign for one chart.
const STATUS_ORDER: SubmissionStatus[] = [
  "passed",
  "submitted",
  "needs_rework",
  "in_progress",
  "not_started",
];

const SEGMENT_STROKE_CLASS: Record<SubmissionStatus, string> = {
  passed: "stroke-success-fg",
  submitted: "stroke-done-fg",
  needs_rework: "stroke-attention-fg",
  in_progress: "stroke-accent",
  not_started: "stroke-line",
};

export function StatusDonut({ counts }: { counts: StatusCounts }) {
  const total = STATUS_ORDER.reduce((sum, s) => sum + counts[s], 0);
  if (total === 0) return null;

  const radius = 52;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;
  const gap = 4; // px of track color between segments, the ring's version of a 2px stacked-bar surface gap

  let cumulative = 0;
  const segments = STATUS_ORDER.filter((s) => counts[s] > 0).map((status) => {
    const raw = (counts[status] / total) * circumference;
    const length = Math.max(raw - gap, 0);
    const dashOffset = -cumulative;
    cumulative += raw;
    return { status, length, dashOffset };
  });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg width={130} height={130} viewBox="0 0 130 130" className="-rotate-90 shrink-0">
        <circle
          cx={65}
          cy={65}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-canvas-inset"
        />
        {segments.map(({ status, length, dashOffset }) => (
          <circle
            key={status}
            cx={65}
            cy={65}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={dashOffset}
            className={SEGMENT_STROKE_CLASS[status]}
          />
        ))}
      </svg>
      <div className="flex flex-col gap-2">
        {STATUS_ORDER.filter((s) => counts[s] > 0).map((status) => (
          <span key={status} className="flex items-center gap-2 text-sm">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_FILL_CLASS[status]}`}
              aria-hidden="true"
            />
            <span className="text-fg-muted">{STATUS_LABEL[status]}</span>
            <span className="font-semibold text-fg">{counts[status]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
