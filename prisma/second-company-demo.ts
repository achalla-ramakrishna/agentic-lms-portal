// A second, distinctly-branded company — proof that the embed widget
// (docs/features/0016-embed-widget.md), company scoping (docs/adr/
// 0004-multi-tenant-companies.md), and the role split (docs/features/
// 0018-role-separation.md) all genuinely work for more than one
// client, not just CodeWalnut. Mirrors demo-data.ts's depth on
// purpose — 5 learners at varied progress, a facilitator with a real
// decision, plus a company_admin — so Acme Robotics is as convincing a
// demo as CodeWalnut, not a token second row. Idempotent, same
// upsert-by-email/slug pattern as the rest of prisma/seed.ts.
import type { PrismaClient, SubmissionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const PASSWORD = "AcmeDemo2026!";

const COMPANY = {
  name: "Acme Robotics",
  slug: "acme-robotics",
  // A generated placeholder logo (real, loadable image — not a fake
  // company's real mark, since Acme Robotics itself is illustrative)
  // so the branded login page has something genuine to render.
  logoUrl: "https://ui-avatars.com/api/?name=Acme+Robotics&background=e8590c&color=ffffff&bold=true&size=128",
  accentColor: "#e8590c",
};

const FACILITATOR = { name: "Morgan Reyes", email: "morgan.reyes@acme-robotics.example.com" };
const COMPANY_ADMIN = { name: "Devon Park", email: "devon.park@acme-robotics.example.com" };

type ProgressEntry = {
  competencyNumber: number;
  exerciseNumber: number;
  status: SubmissionStatus;
  facilitatorComment?: string;
  learnerNote?: string;
  daysAgo: number;
};
type LearnerPlan = { name: string; email: string; progress: ProgressEntry[] };

// Five learners at different points, same spread as demo-data.ts's
// CodeWalnut cohort (brand new, mid-progress with a rework, a pending-
// review queue, and two advanced/near-complete) so a roster or
// dashboard screenshot for Acme shows real variety too, not a flat
// placeholder state.
const LEARNERS: LearnerPlan[] = [
  {
    name: "Sam Okoye",
    email: "sam.okoye@acme-robotics.example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "passed", daysAgo: 3 },
      { competencyNumber: 1, exerciseNumber: 2, status: "in_progress", daysAgo: 1 },
    ],
  },
  {
    name: "Ines Duarte",
    email: "ines.duarte@acme-robotics.example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "passed", daysAgo: 9 },
      { competencyNumber: 1, exerciseNumber: 2, status: "passed", daysAgo: 8 },
      {
        competencyNumber: 2,
        exerciseNumber: 1,
        status: "needs_rework",
        daysAgo: 3,
        facilitatorComment:
          "Good spec structure, but the acceptance criteria don't cover the concurrent-access case we discussed. Add that scenario and resubmit.",
        learnerNote: "Focused on the happy path first — will add the concurrency scenario next.",
      },
      { competencyNumber: 2, exerciseNumber: 2, status: "in_progress", daysAgo: 1 },
    ],
  },
  {
    name: "Noah Kim",
    email: "noah.kim@acme-robotics.example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "passed", daysAgo: 14 },
      { competencyNumber: 1, exerciseNumber: 2, status: "passed", daysAgo: 13 },
      {
        competencyNumber: 2,
        exerciseNumber: 1,
        status: "submitted",
        daysAgo: 3,
        learnerNote: "Spec + clarifications doc both linked below.",
      },
      { competencyNumber: 2, exerciseNumber: 2, status: "submitted", daysAgo: 2 },
      { competencyNumber: 3, exerciseNumber: 1, status: "submitted", daysAgo: 1 },
    ],
  },
  {
    name: "Fatima Al-Sayed",
    email: "fatima.alsayed@acme-robotics.example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "passed", daysAgo: 24 },
      { competencyNumber: 1, exerciseNumber: 2, status: "passed", daysAgo: 23 },
      { competencyNumber: 2, exerciseNumber: 1, status: "passed", daysAgo: 21 },
      { competencyNumber: 2, exerciseNumber: 2, status: "passed", daysAgo: 20 },
      { competencyNumber: 3, exerciseNumber: 1, status: "passed", daysAgo: 18 },
      { competencyNumber: 3, exerciseNumber: 2, status: "passed", daysAgo: 17 },
      { competencyNumber: 3, exerciseNumber: 3, status: "passed", daysAgo: 16 },
      {
        competencyNumber: 4,
        exerciseNumber: 1,
        status: "passed",
        daysAgo: 14,
        facilitatorComment: "Solid test coverage on the rescue scenario. Approved.",
      },
      { competencyNumber: 4, exerciseNumber: 2, status: "submitted", daysAgo: 1 },
    ],
  },
  {
    name: "Chen Wei",
    email: "chen.wei@acme-robotics.example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "passed", daysAgo: 30 },
      { competencyNumber: 1, exerciseNumber: 2, status: "passed", daysAgo: 29 },
      { competencyNumber: 2, exerciseNumber: 1, status: "passed", daysAgo: 27 },
      { competencyNumber: 2, exerciseNumber: 2, status: "passed", daysAgo: 26 },
      { competencyNumber: 3, exerciseNumber: 1, status: "passed", daysAgo: 24 },
      { competencyNumber: 3, exerciseNumber: 2, status: "passed", daysAgo: 23 },
      { competencyNumber: 3, exerciseNumber: 3, status: "passed", daysAgo: 22 },
      { competencyNumber: 4, exerciseNumber: 1, status: "passed", daysAgo: 20 },
      { competencyNumber: 4, exerciseNumber: 2, status: "passed", daysAgo: 19 },
      { competencyNumber: 4, exerciseNumber: 3, status: "passed", daysAgo: 18 },
      { competencyNumber: 5, exerciseNumber: 1, status: "passed", daysAgo: 16 },
      { competencyNumber: 5, exerciseNumber: 2, status: "passed", daysAgo: 15 },
      {
        competencyNumber: 5,
        exerciseNumber: 3,
        status: "passed",
        daysAgo: 14,
        facilitatorComment: "Clean skill package, benchmark gate passes cleanly. Approved.",
      },
      { competencyNumber: 6, exerciseNumber: 1, status: "in_progress", daysAgo: 1 },
    ],
  },
];

function hoursAgo(now: Date, hours: number): Date {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

export async function seedSecondCompanyDemo(prisma: PrismaClient) {
  const now = new Date();
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const company = await prisma.company.upsert({
    where: { slug: COMPANY.slug },
    update: { name: COMPANY.name, logoUrl: COMPANY.logoUrl, accentColor: COMPANY.accentColor },
    create: COMPANY,
  });

  const facilitator = await prisma.user.upsert({
    where: { email: FACILITATOR.email },
    update: { name: FACILITATOR.name, role: "facilitator", passwordHash },
    create: {
      name: FACILITATOR.name,
      email: FACILITATOR.email,
      role: "facilitator",
      passwordHash,
      companyId: company.id,
    },
  });

  await prisma.user.upsert({
    where: { email: COMPANY_ADMIN.email },
    update: { name: COMPANY_ADMIN.name, role: "company_admin", passwordHash },
    create: {
      name: COMPANY_ADMIN.name,
      email: COMPANY_ADMIN.email,
      role: "company_admin",
      passwordHash,
      companyId: company.id,
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
        companyId: company.id,
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
      if (!exercise) continue;

      const startedAt = hoursAgo(now, entry.daysAgo * 24);
      const isDecided = entry.status === "passed" || entry.status === "needs_rework";
      const isSubmitted = isDecided || entry.status === "submitted";
      const submittedAt = isSubmitted ? hoursAgo(now, entry.daysAgo * 24 - 3) : null;
      const decidedAt = isDecided ? hoursAgo(now, entry.daysAgo * 24 - 6) : null;
      const projectName = exercise.projects[0]?.repoPath.split("/").pop() ?? "project";
      const prNumber = 200 + exercise.id;

      const submission = await prisma.submission.upsert({
        where: { userId_exerciseId: { userId: user.id, exerciseId: exercise.id } },
        update: {
          status: entry.status,
          startedAt,
          submittedAt,
          decidedAt,
          decidedById: isDecided ? facilitator.id : null,
          facilitatorComment: entry.facilitatorComment ?? null,
          learnerNote: entry.learnerNote ?? null,
          prLink: isSubmitted
            ? `https://github.com/acme-robotics-demo/${projectName}/pull/${prNumber}`
            : null,
        },
        create: {
          userId: user.id,
          exerciseId: exercise.id,
          status: entry.status,
          startedAt,
          submittedAt,
          decidedAt,
          decidedById: isDecided ? facilitator.id : null,
          facilitatorComment: entry.facilitatorComment ?? null,
          learnerNote: entry.learnerNote ?? null,
          prLink: isSubmitted
            ? `https://github.com/acme-robotics-demo/${projectName}/pull/${prNumber}`
            : null,
        },
      });

      if (isSubmitted) {
        const checklist: { label: string }[] = JSON.parse(exercise.evidenceChecklist);
        await prisma.evidenceArtifact.deleteMany({ where: { submissionId: submission.id } });
        await prisma.evidenceArtifact.createMany({
          data: checklist.map((item) => ({
            submissionId: submission.id,
            checklistLabel: item.label,
            kind: "link" as const,
            url: `https://github.com/acme-robotics-demo/${projectName}/blob/main/${item.label}`,
          })),
        });
      }
    }
  }

  console.log(
    `Seeded second company: ${COMPANY.name} (slug: ${COMPANY.slug}) — 1 facilitator, 1 company_admin, ${LEARNERS.length} learners. Password: ${PASSWORD}`,
  );
}
