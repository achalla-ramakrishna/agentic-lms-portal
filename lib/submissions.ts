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
