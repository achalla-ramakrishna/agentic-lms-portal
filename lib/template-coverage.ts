import { prisma } from "@/lib/db";

export type TemplateCoverageInput = {
  number: number;
  title: string;
  exercises: { docCount: number }[];
};

export type TemplateCoverageRow = {
  number: number;
  title: string;
  exerciseCount: number;
  exercisesWithDocs: number;
  totalDocs: number;
};

// Pure aggregation — no Prisma, no I/O, so it's directly testable
// (__tests__/template-coverage.test.ts). Counts real guidance docs
// (lib/competency-artifacts.ts's sibling feature) per competency, for a
// facilitator-facing "is this competency's content actually there" view
// on the roster page — separate from learner progress (lib/roster.ts).
export function aggregateTemplateCoverage(
  competencies: TemplateCoverageInput[],
): TemplateCoverageRow[] {
  return competencies.map((c) => ({
    number: c.number,
    title: c.title,
    exerciseCount: c.exercises.length,
    exercisesWithDocs: c.exercises.filter((e) => e.docCount > 0).length,
    totalDocs: c.exercises.reduce((sum, e) => sum + e.docCount, 0),
  }));
}

export async function templateCoverage(): Promise<TemplateCoverageRow[]> {
  const competencies = await prisma.competency.findMany({
    orderBy: { number: "asc" },
    include: {
      exercises: {
        select: { _count: { select: { guidanceDocs: true } } },
      },
    },
  });

  return aggregateTemplateCoverage(
    competencies.map((c) => ({
      number: c.number,
      title: c.title,
      exercises: c.exercises.map((e) => ({ docCount: e._count.guidanceDocs })),
    })),
  );
}
