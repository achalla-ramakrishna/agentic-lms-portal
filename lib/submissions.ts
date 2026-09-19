import { prisma } from "@/lib/db";
import type { Submission } from "@prisma/client";

// Read-only lookup — merely viewing an exercise shouldn't write a
// not_started row for it. Returns null (never a fabricated row) when the
// learner hasn't interacted with this exercise yet.
export async function getSubmission(
  userId: number,
  exerciseId: number,
): Promise<Submission | null> {
  return prisma.submission.findUnique({
    where: { userId_exerciseId: { userId, exerciseId } },
  });
}

// Only called from an actual state transition (start/submit) — creates
// the row on first real interaction, not on page view.
export async function getOrCreateSubmission(
  userId: number,
  exerciseId: number,
): Promise<Submission> {
  return prisma.submission.upsert({
    where: { userId_exerciseId: { userId, exerciseId } },
    update: {},
    create: { userId, exerciseId, status: "not_started" },
  });
}

export const STATUS_LABEL: Record<Submission["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  submitted: "Submitted",
  needs_rework: "Needs rework",
  passed: "Passed",
};

// GitHub label-pill colors (ADR 0003): muted gray / accent blue / done
// purple / attention yellow / success green — one source of truth so the
// same status always reads the same color everywhere it's shown
// (dashboard, competency/exercise pages, profile, roster, submissions).
// A tinted-fill-only pill barely read as a pill against the card
// background it sits on (same low luminance) — GitHub's real label chips
// use a colored border for definition, so these do too.
export const STATUS_BADGE_CLASS: Record<Submission["status"], string> = {
  not_started: "border border-line text-fg-muted",
  in_progress: "border border-accent/40 bg-accent/10 text-accent",
  submitted: "border border-done-fg/40 bg-done-fg/10 text-done-fg",
  needs_rework:
    "border border-attention-fg/40 bg-attention-fg/10 text-attention-fg",
  passed: "border border-success-fg/40 bg-success-fg/10 text-success-fg",
};
