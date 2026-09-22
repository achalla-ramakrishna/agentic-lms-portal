import type { SubmissionStatus } from "@prisma/client";

export type StatusCounts = Record<SubmissionStatus, number>;

// Pure aggregation — no Prisma, so directly testable
// (__tests__/dashboard-stats.test.ts). `submissions` may already include
// explicit not_started rows (getOrCreateSubmission can persist one before
// a real transition flips it) as well as exercises with no row at all —
// both count as not_started, so the two are added rather than one
// overwriting the other.
export function statusBreakdown(
  submissions: { status: SubmissionStatus }[],
  totalExercises: number,
): StatusCounts {
  const counts: StatusCounts = {
    not_started: 0,
    in_progress: 0,
    submitted: 0,
    needs_rework: 0,
    passed: 0,
  };
  for (const s of submissions) counts[s.status]++;
  counts.not_started += Math.max(0, totalExercises - submissions.length);
  return counts;
}

// Six encouragement bands by overall completion percentage, for the
// dashboard's "snapshot" framing — always a positive, forward-looking
// read even at 0%.
export function progressMessage(pct: number): string {
  if (pct >= 100) return "All 12 competencies mastered — outstanding work.";
  if (pct >= 75) return "Almost there — the finish line is close.";
  if (pct >= 50) return "Over halfway there. Strong work.";
  if (pct >= 25) return "Solid progress — you're building real momentum.";
  if (pct > 0) return "Off to a strong start. Keep the momentum going.";
  return "Your journey starts here — pick a competency and dive in.";
}

// Whole days between two dates, floor-rounded, never negative — used for
// "Day N of your journey" on the dashboard.
export function daysSince(date: Date, now: Date): number {
  const ms = now.getTime() - date.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}
