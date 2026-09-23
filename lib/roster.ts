import { prisma } from "@/lib/db";
import type { SubmissionStatus } from "@prisma/client";

export type RosterRow = {
  userId: number;
  name: string;
  email: string;
  perCompetency: Map<number, { passed: number; total: number }>; // key: competency number
  passedCount: number;
  totalExercises: number;
  pendingCount: number;
  lastActivity: Date | null;
};

export type RosterLearnerInput = { id: number; name: string; email: string };
export type RosterCompetencyInput = { number: number; exerciseCount: number };
export type RosterSubmissionInput = {
  userId: number;
  competencyNumber: number;
  status: SubmissionStatus;
  submittedAt: Date | null;
  startedAt: Date | null;
};

// Pure aggregation — no Prisma, no I/O, so it's directly testable
// (__tests__/roster.test.ts) against synthetic multi-learner input. Same
// "passed/total per competency" shape app/dashboard/page.tsx uses for one
// learner, generalized across all of them — see
// docs/features/0005-facilitator-flow.md's acceptance criterion that the
// two must agree exactly.
export function aggregateRoster(
  learners: RosterLearnerInput[],
  competencies: RosterCompetencyInput[],
  submissions: RosterSubmissionInput[],
): RosterRow[] {
  const totalExercises = competencies.reduce(
    (sum, c) => sum + c.exerciseCount,
    0,
  );

  const submissionsByUser = new Map<number, RosterSubmissionInput[]>();
  for (const s of submissions) {
    const list = submissionsByUser.get(s.userId) ?? [];
    list.push(s);
    submissionsByUser.set(s.userId, list);
  }

  const rows: RosterRow[] = learners.map((user) => {
    const userSubmissions = submissionsByUser.get(user.id) ?? [];

    const perCompetency = new Map<number, { passed: number; total: number }>();
    for (const c of competencies) {
      perCompetency.set(c.number, { passed: 0, total: c.exerciseCount });
    }

    let passedCount = 0;
    let pendingCount = 0;
    let lastActivity: Date | null = null;

    for (const s of userSubmissions) {
      if (s.status === "passed") {
        passedCount++;
        const cell = perCompetency.get(s.competencyNumber);
        if (cell) cell.passed++;
      }
      if (s.status === "submitted") pendingCount++;

      const activity = s.submittedAt ?? s.startedAt;
      if (activity && (!lastActivity || activity > lastActivity)) {
        lastActivity = activity;
      }
    }

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      perCompetency,
      passedCount,
      totalExercises,
      pendingCount,
      lastActivity,
    };
  });

  // Pending-submissions-first, per docs/SPEC.md Flow B step 1.
  rows.sort((a, b) => b.pendingCount - a.pendingCount);

  return rows;
}

export async function buildRoster(companyId: number): Promise<RosterRow[]> {
  const [learners, competencies, submissions] = await Promise.all([
    prisma.user.findMany({ where: { role: "learner", companyId } }),
    prisma.competency.findMany({
      orderBy: { number: "asc" },
      include: { exercises: { select: { id: true } } },
    }),
    prisma.submission.findMany({
      where: { user: { companyId } },
      include: { exercise: { select: { competencyId: true } } },
    }),
  ]);

  const competencyNumberByCompetencyId = new Map(
    competencies.map((c) => [c.id, c.number]),
  );

  return aggregateRoster(
    learners,
    competencies.map((c) => ({
      number: c.number,
      exerciseCount: c.exercises.length,
    })),
    submissions.map((s) => ({
      userId: s.userId,
      competencyNumber:
        competencyNumberByCompetencyId.get(s.exercise.competencyId) ?? -1,
      status: s.status,
      submittedAt: s.submittedAt,
      startedAt: s.startedAt,
    })),
  );
}

export type PendingSubmission = {
  id: number;
  learnerName: string;
  exerciseTitle: string;
  competencyNumber: number;
  exerciseNumber: number;
  submittedAt: Date | null;
};

export async function pendingSubmissions(
  companyId: number,
): Promise<PendingSubmission[]> {
  const submissions = await prisma.submission.findMany({
    where: { status: "submitted", user: { companyId } },
    orderBy: { submittedAt: "asc" },
    include: {
      user: true,
      exercise: { include: { competency: true } },
    },
  });

  return submissions.map((s) => ({
    id: s.id,
    learnerName: s.user.name,
    exerciseTitle: s.exercise.title,
    competencyNumber: s.exercise.competency.number,
    exerciseNumber: s.exercise.number,
    submittedAt: s.submittedAt,
  }));
}
