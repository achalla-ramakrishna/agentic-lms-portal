// Realistic demo accounts + submission history for customer/conference
// demos — real names instead of "Demo User 1/2", a spread of progress
// levels, and at least one reviewer decision with a real facilitator
// comment so the review workflow has something to show, not just an
// empty roster. Idempotent (upsert-by-email, same as the rest of
// prisma/seed.ts) so re-running it in place — including on every
// Railway deploy, since railway.json's startCommand runs `db:seed`
// every time — never duplicates rows.
import type { PrismaClient, SubmissionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const DEMO_PASSWORD = "Conference2026!";

type ProgressEntry = {
  competencyNumber: number;
  exerciseNumber: number;
  status: SubmissionStatus;
  facilitatorComment?: string;
  learnerNote?: string;
  daysAgo: number; // when this exercise was started, roughly
};

type LearnerPlan = {
  name: string;
  email: string;
  progress: ProgressEntry[];
};

const REVIEWER = { name: "Jordan Blake", email: "jordan.blake@example.com" };

// Five learners at different points in the curriculum — a brand-new
// starter, two mid-progress (one with a rework, one with a pending
// review queue), and two advanced/near-complete — so a roster or
// dashboard screenshot shows real variety instead of one flat state.
const LEARNERS: LearnerPlan[] = [
  {
    name: "Priya Natarajan",
    email: "priya.natarajan@example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "passed", daysAgo: 2 },
      { competencyNumber: 1, exerciseNumber: 2, status: "in_progress", daysAgo: 1 },
    ],
  },
  {
    name: "Diego Fernandez",
    email: "diego.fernandez@example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "passed", daysAgo: 12 },
      { competencyNumber: 1, exerciseNumber: 2, status: "passed", daysAgo: 11 },
      { competencyNumber: 2, exerciseNumber: 1, status: "passed", daysAgo: 9 },
      { competencyNumber: 2, exerciseNumber: 2, status: "passed", daysAgo: 8 },
      { competencyNumber: 3, exerciseNumber: 1, status: "passed", daysAgo: 6 },
      { competencyNumber: 3, exerciseNumber: 2, status: "passed", daysAgo: 5 },
      { competencyNumber: 3, exerciseNumber: 3, status: "passed", daysAgo: 4 },
      {
        competencyNumber: 4,
        exerciseNumber: 1,
        status: "needs_rework",
        daysAgo: 3,
        facilitatorComment:
          "Good structure overall, but the concurrent-checkout race condition isn't covered — add a test that fires two requests at once and asserts only one wins, then resubmit.",
        learnerNote: "Used Playwright MCP to record the flow and harden the flaky waits.",
      },
      { competencyNumber: 4, exerciseNumber: 2, status: "in_progress", daysAgo: 1 },
    ],
  },
  {
    name: "Liam Carter",
    email: "liam.carter@example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "passed", daysAgo: 15 },
      { competencyNumber: 1, exerciseNumber: 2, status: "passed", daysAgo: 14 },
      { competencyNumber: 2, exerciseNumber: 1, status: "passed", daysAgo: 12 },
      { competencyNumber: 2, exerciseNumber: 2, status: "passed", daysAgo: 11 },
      {
        competencyNumber: 3,
        exerciseNumber: 1,
        status: "submitted",
        daysAgo: 3,
        learnerNote: "Session handover doc plus the actual Claude-to-Codex transcript are both linked below.",
      },
      { competencyNumber: 3, exerciseNumber: 2, status: "submitted", daysAgo: 2 },
      { competencyNumber: 3, exerciseNumber: 3, status: "submitted", daysAgo: 1 },
    ],
  },
  {
    name: "Amara Okafor",
    email: "amara.okafor@example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "passed", daysAgo: 20 },
      { competencyNumber: 1, exerciseNumber: 2, status: "passed", daysAgo: 19 },
      { competencyNumber: 2, exerciseNumber: 1, status: "passed", daysAgo: 18 },
      { competencyNumber: 2, exerciseNumber: 2, status: "passed", daysAgo: 17 },
      { competencyNumber: 3, exerciseNumber: 1, status: "passed", daysAgo: 15 },
      { competencyNumber: 3, exerciseNumber: 2, status: "passed", daysAgo: 14 },
      { competencyNumber: 3, exerciseNumber: 3, status: "passed", daysAgo: 13 },
      { competencyNumber: 4, exerciseNumber: 1, status: "passed", daysAgo: 12 },
      { competencyNumber: 4, exerciseNumber: 2, status: "passed", daysAgo: 11 },
      { competencyNumber: 4, exerciseNumber: 3, status: "passed", daysAgo: 10 },
      { competencyNumber: 5, exerciseNumber: 1, status: "passed", daysAgo: 9 },
      { competencyNumber: 5, exerciseNumber: 2, status: "passed", daysAgo: 8 },
      { competencyNumber: 5, exerciseNumber: 3, status: "passed", daysAgo: 7 },
      { competencyNumber: 6, exerciseNumber: 1, status: "passed", daysAgo: 6 },
      { competencyNumber: 6, exerciseNumber: 2, status: "passed", daysAgo: 5 },
      {
        competencyNumber: 6,
        exerciseNumber: 3,
        status: "passed",
        daysAgo: 4,
        facilitatorComment: "Clean parallel-agent setup, worktrees were isolated correctly. Approved.",
      },
      { competencyNumber: 7, exerciseNumber: 1, status: "submitted", daysAgo: 1 },
    ],
  },
  {
    name: "Yuki Tanaka",
    email: "yuki.tanaka@example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "passed", daysAgo: 28 },
      { competencyNumber: 1, exerciseNumber: 2, status: "passed", daysAgo: 27 },
      { competencyNumber: 2, exerciseNumber: 1, status: "passed", daysAgo: 26 },
      { competencyNumber: 2, exerciseNumber: 2, status: "passed", daysAgo: 25 },
      { competencyNumber: 3, exerciseNumber: 1, status: "passed", daysAgo: 24 },
      { competencyNumber: 3, exerciseNumber: 2, status: "passed", daysAgo: 23 },
      { competencyNumber: 3, exerciseNumber: 3, status: "passed", daysAgo: 22 },
      { competencyNumber: 4, exerciseNumber: 1, status: "passed", daysAgo: 21 },
      { competencyNumber: 4, exerciseNumber: 2, status: "passed", daysAgo: 20 },
      { competencyNumber: 4, exerciseNumber: 3, status: "passed", daysAgo: 19 },
      { competencyNumber: 5, exerciseNumber: 1, status: "passed", daysAgo: 18 },
      { competencyNumber: 5, exerciseNumber: 2, status: "passed", daysAgo: 17 },
      { competencyNumber: 5, exerciseNumber: 3, status: "passed", daysAgo: 16 },
      { competencyNumber: 6, exerciseNumber: 1, status: "passed", daysAgo: 15 },
      { competencyNumber: 6, exerciseNumber: 2, status: "passed", daysAgo: 14 },
      { competencyNumber: 6, exerciseNumber: 3, status: "passed", daysAgo: 13 },
      { competencyNumber: 7, exerciseNumber: 1, status: "passed", daysAgo: 12 },
      { competencyNumber: 7, exerciseNumber: 2, status: "passed", daysAgo: 11 },
      { competencyNumber: 7, exerciseNumber: 3, status: "passed", daysAgo: 10 },
      { competencyNumber: 7, exerciseNumber: 4, status: "passed", daysAgo: 9 },
      { competencyNumber: 8, exerciseNumber: 1, status: "passed", daysAgo: 8 },
      { competencyNumber: 8, exerciseNumber: 2, status: "passed", daysAgo: 7 },
      { competencyNumber: 8, exerciseNumber: 3, status: "passed", daysAgo: 6 },
      { competencyNumber: 9, exerciseNumber: 1, status: "passed", daysAgo: 5 },
      { competencyNumber: 9, exerciseNumber: 2, status: "passed", daysAgo: 4 },
      {
        competencyNumber: 9,
        exerciseNumber: 3,
        status: "passed",
        daysAgo: 3,
        facilitatorComment: "Excellent review coverage — exactly the depth we want. Approved.",
      },
      { competencyNumber: 10, exerciseNumber: 1, status: "passed", daysAgo: 2 },
      { competencyNumber: 10, exerciseNumber: 2, status: "in_progress", daysAgo: 1 },
    ],
  },
];

function hoursAgo(now: Date, hours: number): Date {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

export async function seedDemoData(prisma: PrismaClient, companyId: number) {
  const now = new Date();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const reviewer = await prisma.user.upsert({
    where: { email: REVIEWER.email },
    update: { name: REVIEWER.name, role: "facilitator", passwordHash },
    create: {
      name: REVIEWER.name,
      email: REVIEWER.email,
      role: "facilitator",
      passwordHash,
      companyId,
    },
  });

  for (const learner of LEARNERS) {
    const user = await prisma.user.upsert({
      where: { email: learner.email },
      update: { name: learner.name, role: "learner", passwordHash },
      create: {
        name: learner.name,
        email: learner.email,
        role: "learner",
        passwordHash,
        companyId,
      },
    });

    for (const entry of learner.progress) {
      const exercise = await prisma.exercise.findFirst({
        where: {
          number: entry.exerciseNumber,
          competency: { number: entry.competencyNumber },
        },
        include: { projects: true },
      });
      if (!exercise) continue; // content changed since this plan was written

      const startedAt = hoursAgo(now, entry.daysAgo * 24);
      const isDecided = entry.status === "passed" || entry.status === "needs_rework";
      const isSubmitted = isDecided || entry.status === "submitted";
      const submittedAt = isSubmitted ? hoursAgo(now, entry.daysAgo * 24 - 3) : null;
      const decidedAt = isDecided ? hoursAgo(now, entry.daysAgo * 24 - 6) : null;
      const projectName = exercise.projects[0]?.repoPath.split("/").pop() ?? "project";
      const prNumber = 100 + exercise.id;

      const submission = await prisma.submission.upsert({
        where: { userId_exerciseId: { userId: user.id, exerciseId: exercise.id } },
        update: {
          status: entry.status,
          startedAt,
          submittedAt,
          decidedAt,
          decidedById: isDecided ? reviewer.id : null,
          facilitatorComment: entry.facilitatorComment ?? null,
          learnerNote: entry.learnerNote ?? null,
          prLink: isSubmitted
            ? `https://github.com/agentic-eng-demo/${projectName}/pull/${prNumber}`
            : null,
        },
        create: {
          userId: user.id,
          exerciseId: exercise.id,
          status: entry.status,
          startedAt,
          submittedAt,
          decidedAt,
          decidedById: isDecided ? reviewer.id : null,
          facilitatorComment: entry.facilitatorComment ?? null,
          learnerNote: entry.learnerNote ?? null,
          prLink: isSubmitted
            ? `https://github.com/agentic-eng-demo/${projectName}/pull/${prNumber}`
            : null,
        },
      });

      if (isSubmitted) {
        const checklist: { label: string }[] = JSON.parse(exercise.evidenceChecklist);
        await prisma.evidenceArtifact.deleteMany({
          where: { submissionId: submission.id },
        });
        await prisma.evidenceArtifact.createMany({
          data: checklist.map((item) => ({
            submissionId: submission.id,
            checklistLabel: item.label,
            kind: "link" as const,
            url: `https://github.com/agentic-eng-demo/${projectName}/blob/main/${item.label}`,
          })),
        });
      }
    }
  }

  console.log(
    `Seeded demo data: 1 reviewer (${REVIEWER.name}) + ${LEARNERS.length} learners with realistic progress. Shared password: ${DEMO_PASSWORD}`,
  );
}
