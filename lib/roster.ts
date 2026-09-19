import { prisma } from "@/lib/db";

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

// Same "passed/total per competency" shape as app/dashboard/page.tsx,
// generalized across every learner instead of one — see
// docs/features/0005-facilitator-flow.md's acceptance criterion that
// these two must agree exactly.
export async function buildRoster(): Promise<RosterRow[]> {
  const [learners, competencies, submissions] = await Promise.all([
    prisma.user.findMany({ where: { role: "learner" } }),
    prisma.competency.findMany({
      orderBy: { number: "asc" },
      include: { exercises: { select: { id: true } } },
    }),
    prisma.submission.findMany({
      include: { exercise: { select: { competencyId: true } } },
    }),
  ]);

  const competencyNumberByExerciseCompetencyId = new Map(
    competencies.map((c) => [c.id, c.number]),
  );
  const totalByCompetencyNumber = new Map(
    competencies.map((c) => [c.number, c.exercises.length]),
  );
  const totalExercises = competencies.reduce(
    (sum, c) => sum + c.exercises.length,
    0,
  );

  const submissionsByUser = new Map<number, typeof submissions>();
  for (const s of submissions) {
    const list = submissionsByUser.get(s.userId) ?? [];
    list.push(s);
    submissionsByUser.set(s.userId, list);
  }

  const rows: RosterRow[] = learners.map((user) => {
    const userSubmissions = submissionsByUser.get(user.id) ?? [];

    const perCompetency = new Map<number, { passed: number; total: number }>();
    for (const c of competencies) {
      perCompetency.set(c.number, {
        passed: 0,
        total: totalByCompetencyNumber.get(c.number) ?? 0,
      });
    }
    let passedCount = 0;
    let pendingCount = 0;
    let lastActivity: Date | null = null;

    for (const s of userSubmissions) {
      const competencyNumber = competencyNumberByExerciseCompetencyId.get(
        s.exercise.competencyId,
      );
      if (s.status === "passed") {
        passedCount++;
        if (competencyNumber !== undefined) {
          perCompetency.get(competencyNumber)!.passed++;
        }
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

export type PendingSubmission = {
  id: number;
  learnerName: string;
  exerciseTitle: string;
  competencyNumber: number;
  exerciseNumber: number;
  submittedAt: Date | null;
};

export async function pendingSubmissions(): Promise<PendingSubmission[]> {
  const submissions = await prisma.submission.findMany({
    where: { status: "submitted" },
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
