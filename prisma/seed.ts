// Idempotent: upserts by number (competency) / slug (exercise), per
// docs/adr/0002-v1-scope-decisions.md Q5. Safe to re-run after
// regenerating content/seed.json (scripts/generate-seed.mjs).
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

type SeedEvidenceItem = { label: string };
type SeedProject = {
  displayName: string;
  repoPath: string;
  isPrimary: boolean;
};
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
};
type SeedCompetency = {
  number: number;
  title: string;
  subtitle: string;
  shiftMarkdown: string;
  masteryBullets: string[];
  commonMistakeMarkdown: string;
  toolkitTags: string[];
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
        shiftMarkdown: c.shiftMarkdown,
        masteryBullets: JSON.stringify(c.masteryBullets),
        commonMistakeMarkdown: c.commonMistakeMarkdown,
        toolkitTags: JSON.stringify(c.toolkitTags),
      },
      create: {
        number: c.number,
        title: c.title,
        subtitle: c.subtitle,
        shiftMarkdown: c.shiftMarkdown,
        masteryBullets: JSON.stringify(c.masteryBullets),
        commonMistakeMarkdown: c.commonMistakeMarkdown,
        toolkitTags: JSON.stringify(c.toolkitTags),
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
  }

  console.log(
    `Seeded ${seed.competencies.length} competencies, ${seed.exercises.length} exercises.`,
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
