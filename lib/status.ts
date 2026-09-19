// Pure submission-status transition rules — no Prisma, no Next.js request
// context, so they're directly unit-testable (__tests__/status.test.ts)
// and are the single source of truth app/actions.ts defers to, instead of
// re-deriving "which statuses allow X" inline at each call site.
import type { SubmissionStatus } from "@prisma/client";

export function canStart(status: SubmissionStatus): boolean {
  return status === "not_started";
}

export function canSubmitEvidence(status: SubmissionStatus): boolean {
  return status === "in_progress" || status === "needs_rework";
}

export function canEditSubmission(status: SubmissionStatus): boolean {
  return canSubmitEvidence(status);
}

export type Decision = "passed" | "needs_rework";

export function isValidDecision(value: unknown): value is Decision {
  return value === "passed" || value === "needs_rework";
}

// A decision only makes sense against a submitted submission — this is
// enforced by the review UI only rendering the decision form then, but
// the rule itself belongs here so app/actions.ts's server-side check and
// the UI's conditional rendering can't silently drift apart.
export function canDecide(status: SubmissionStatus): boolean {
  return status === "submitted";
}
