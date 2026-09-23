import type { SubmissionStatus } from "@prisma/client";
import { statusBreakdown, type StatusCounts } from "./dashboard-stats";

export type CompanyCompetencyInput = {
  number: number;
  title: string;
  exerciseIds: number[];
};
export type CompanySubmissionInput = {
  exerciseId: number;
  status: SubmissionStatus;
};

export type CompanyOverview = {
  learnerCount: number;
  overallPct: number;
  counts: StatusCounts;
  competencyProgress: {
    number: number;
    title: string;
    passed: number;
    total: number;
  }[];
};

// Pure aggregation — no Prisma, so directly testable
// (__tests__/company-stats.test.ts), same discipline as
// dashboard-stats.ts (per-learner) and roster.ts's aggregateRoster
// (per-learner-per-competency). "total" for a competency here is
// exerciseCount * learnerCount, not just exerciseCount — every
// learner's own copy of that competency's exercises counts as a slot,
// the same way statusBreakdown treats a missing submission row as
// not_started for one learner.
export function companyOverview(
  learnerCount: number,
  submissions: CompanySubmissionInput[],
  competencies: CompanyCompetencyInput[],
): CompanyOverview {
  const totalExercisesPerLearner = competencies.reduce(
    (sum, c) => sum + c.exerciseIds.length,
    0,
  );
  const totalSlots = totalExercisesPerLearner * learnerCount;

  const passedCount = submissions.filter((s) => s.status === "passed").length;
  const overallPct =
    totalSlots === 0 ? 0 : Math.round((passedCount / totalSlots) * 100);
  const counts = statusBreakdown(submissions, totalSlots);

  const competencyNumberByExerciseId = new Map<number, number>();
  for (const c of competencies) {
    for (const exerciseId of c.exerciseIds) {
      competencyNumberByExerciseId.set(exerciseId, c.number);
    }
  }
  const passedByCompetency = new Map<number, number>();
  for (const s of submissions) {
    if (s.status !== "passed") continue;
    const number = competencyNumberByExerciseId.get(s.exerciseId);
    if (number === undefined) continue;
    passedByCompetency.set(number, (passedByCompetency.get(number) ?? 0) + 1);
  }

  const competencyProgress = competencies.map((c) => ({
    number: c.number,
    title: c.title,
    passed: passedByCompetency.get(c.number) ?? 0,
    total: c.exerciseIds.length * learnerCount,
  }));

  return { learnerCount, overallPct, counts, competencyProgress };
}
