// A second, distinctly-branded company — proof that the embed widget
// (docs/features/0016-embed-widget.md) and company scoping (docs/adr/
// 0004-multi-tenant-companies.md) genuinely work for more than one
// client, not just CodeWalnut. Deliberately lightweight next to
// demo-data.ts's 5-learner CodeWalnut cohort — this exists to
// demonstrate multi-tenancy (a different slug, logo, accent color,
// and its own isolated roster), not to be a second realistic
// conference-demo dataset. Idempotent, same upsert-by-email/slug
// pattern as the rest of prisma/seed.ts.
import type { PrismaClient } from "@prisma/client";
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

const LEARNERS = [
  {
    name: "Sam Okoye",
    email: "sam.okoye@acme-robotics.example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "passed" as const, daysAgo: 4 },
      { competencyNumber: 1, exerciseNumber: 2, status: "passed" as const, daysAgo: 3 },
      { competencyNumber: 2, exerciseNumber: 1, status: "submitted" as const, daysAgo: 1 },
    ],
  },
  {
    name: "Ines Duarte",
    email: "ines.duarte@acme-robotics.example.com",
    progress: [
      { competencyNumber: 1, exerciseNumber: 1, status: "in_progress" as const, daysAgo: 1 },
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
      });
      if (!exercise) continue;

      const startedAt = hoursAgo(now, entry.daysAgo * 24);
      const isSubmitted = entry.status === "submitted" || entry.status === "passed";
      const submittedAt = isSubmitted ? hoursAgo(now, entry.daysAgo * 24 - 3) : null;
      const decidedAt = entry.status === "passed" ? hoursAgo(now, entry.daysAgo * 24 - 6) : null;

      await prisma.submission.upsert({
        where: { userId_exerciseId: { userId: user.id, exerciseId: exercise.id } },
        update: {
          status: entry.status,
          startedAt,
          submittedAt,
          decidedAt,
          decidedById: entry.status === "passed" ? facilitator.id : null,
        },
        create: {
          userId: user.id,
          exerciseId: exercise.id,
          status: entry.status,
          startedAt,
          submittedAt,
          decidedAt,
          decidedById: entry.status === "passed" ? facilitator.id : null,
        },
      });
    }
  }

  console.log(
    `Seeded second company: ${COMPANY.name} (slug: ${COMPANY.slug}) — 1 facilitator + ${LEARNERS.length} learners. Password: ${PASSWORD}`,
  );
}
