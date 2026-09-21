// Idempotent: upserts by number (competency) / slug (exercise), per
// docs/adr/0002-v1-scope-decisions.md Q5. Safe to re-run after
// regenerating content/seed.json (scripts/generate-seed.mjs).
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedEvidenceItem = { label: string };
type SeedProject = {
  displayName: string;
  repoPath: string;
  isPrimary: boolean;
};
type SeedGuidanceDoc = { filename: string; title: string; content: string };
type SeedExercise = {
  competencyNumber: number;
  number: number;
  slug: string;
  title: string;
  missionMarkdown: string;
  durationLabel: string;
  howToSteps: string[];
  evidenceChecklist: SeedEvidenceItem[];
  completionCriteria: string[];
  projects: SeedProject[];
  guidanceDocs: SeedGuidanceDoc[];
};
type SeedCompetency = {
  number: number;
  title: string;
  subtitle: string;
  tagline: string;
  shiftMarkdown: string;
  masteryBullets: string[];
  commonMistakeMarkdown: string;
  toolkitTags: string[];
  inPracticeBullets: string[];
  quoteMarkdown?: string;
  quoteAttribution?: string;
};
type Seed = { competencies: SeedCompetency[]; exercises: SeedExercise[] };

async function main() {
  const seedPath = join(__dirname, "..", "content", "seed.json");
  const seed: Seed = JSON.parse(readFileSync(seedPath, "utf8"));

  for (const c of seed.competencies) {
    await prisma.competency.upsert({
      where: { number: c.number },
      update: {
        title: c.title,
        subtitle: c.subtitle,
        tagline: c.tagline,
        shiftMarkdown: c.shiftMarkdown,
        masteryBullets: JSON.stringify(c.masteryBullets),
        commonMistakeMarkdown: c.commonMistakeMarkdown,
        toolkitTags: JSON.stringify(c.toolkitTags),
        inPracticeBullets: JSON.stringify(c.inPracticeBullets),
        quoteMarkdown: c.quoteMarkdown ?? "",
        quoteAttribution: c.quoteAttribution ?? "",
      },
      create: {
        number: c.number,
        title: c.title,
        subtitle: c.subtitle,
        tagline: c.tagline,
        shiftMarkdown: c.shiftMarkdown,
        masteryBullets: JSON.stringify(c.masteryBullets),
        commonMistakeMarkdown: c.commonMistakeMarkdown,
        toolkitTags: JSON.stringify(c.toolkitTags),
        inPracticeBullets: JSON.stringify(c.inPracticeBullets),
        quoteMarkdown: c.quoteMarkdown ?? "",
        quoteAttribution: c.quoteAttribution ?? "",
      },
    });
  }

  for (const e of seed.exercises) {
    const competency = await prisma.competency.findUniqueOrThrow({
      where: { number: e.competencyNumber },
    });

    const exercise = await prisma.exercise.upsert({
      where: { slug: e.slug },
      update: {
        competencyId: competency.id,
        number: e.number,
        title: e.title,
        missionMarkdown: e.missionMarkdown,
        durationLabel: e.durationLabel,
        howToSteps: JSON.stringify(e.howToSteps),
        evidenceChecklist: JSON.stringify(e.evidenceChecklist),
        completionCriteria: JSON.stringify(e.completionCriteria),
      },
      create: {
        competencyId: competency.id,
        number: e.number,
        slug: e.slug,
        title: e.title,
        missionMarkdown: e.missionMarkdown,
        durationLabel: e.durationLabel,
        howToSteps: JSON.stringify(e.howToSteps),
        evidenceChecklist: JSON.stringify(e.evidenceChecklist),
        completionCriteria: JSON.stringify(e.completionCriteria),
      },
    });

    // Projects have no stable natural key across reseeds — replace wholesale.
    await prisma.exerciseProject.deleteMany({
      where: { exerciseId: exercise.id },
    });
    await prisma.exerciseProject.createMany({
      data: e.projects.map((p) => ({
        exerciseId: exercise.id,
        repoPath: p.repoPath,
        displayName: p.displayName,
        isPrimary: p.isPrimary,
      })),
    });

    // Same replace-wholesale approach as projects — content/seed.json's
    // generate-seed.mjs already sorts guidanceDocs (evidence-template.md
    // first, then A-Z), so array index is the display order.
    await prisma.exerciseGuidanceDoc.deleteMany({
      where: { exerciseId: exercise.id },
    });
    await prisma.exerciseGuidanceDoc.createMany({
      data: e.guidanceDocs.map((d, i) => ({
        exerciseId: exercise.id,
        filename: d.filename,
        title: d.title,
        content: d.content,
        sortOrder: i,
      })),
    });
  }

  // Dev-only demo accounts — see README "Demo accounts" for the fake,
  // documented credentials. Real accounts replace these once there's an
  // actual cohort (docs/features/0003-auth-roles.md non-goals).
  const demoUsers = [
    {
      email: "learner@example.com",
      name: "Demo Learner",
      password: "learner-demo-pw",
      role: "learner" as const,
    },
    {
      email: "facilitator@example.com",
      name: "Demo Facilitator",
      password: "facilitator-demo-pw",
      role: "facilitator" as const,
    },
  ];
  for (const u of demoUsers) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, passwordHash },
      create: {
        email: u.email,
        name: u.name,
        role: u.role,
        passwordHash,
      },
    });
  }

  console.log(
    `Seeded ${seed.competencies.length} competencies, ${seed.exercises.length} exercises, ${demoUsers.length} demo users.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
