import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  masteryBullets,
  toolkitTags,
  inPracticeBullets,
  howToSteps,
  evidenceChecklist,
} from "@/lib/content";
import { COMPETENCY_ICON, competencyStyle } from "@/lib/competency-style";
import { competencyArtifacts } from "@/lib/competency-artifacts";
import { CompetencyTabs } from "./CompetencyTabs";

export const dynamic = "force-dynamic";

export default async function CompetencyPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const competency = await prisma.competency.findUnique({
    where: { number: Number(number) },
    include: {
      exercises: {
        orderBy: { number: "asc" },
        include: {
          projects: true,
          guidanceDocs: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!competency) notFound();

  const artifacts = competencyArtifacts(competency.exercises);
  const toolkitDocs = competency.exercises.flatMap((ex) => ex.guidanceDocs);

  const session = await getServerSession(authOptions);
  const submissions = await prisma.submission.findMany({
    where: {
      userId: Number(session!.user.id),
      exerciseId: { in: competency.exercises.map((ex) => ex.id) },
    },
    select: { exerciseId: true, status: true },
  });
  const statusByExercise = new Map(
    submissions.map((s) => [s.exerciseId, s.status]),
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/competencies" className="text-sm font-medium text-accent hover:underline">
        ← All competencies
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg"
          style={{ borderColor: competencyStyle(competency.number).border }}
          aria-hidden="true"
        >
          {COMPETENCY_ICON[competency.number]}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {String(competency.number).padStart(2, "0")} · {competency.title}
        </h1>
      </div>
      <p className="mt-1 text-fg-muted">{competency.subtitle}</p>

      <div className="mt-6">
        <CompetencyTabs
          competencyNumber={competency.number}
          competencyTitle={competency.title}
          tagline={competency.tagline}
          quoteMarkdown={competency.quoteMarkdown}
          quoteAttribution={competency.quoteAttribution}
          shiftMarkdown={competency.shiftMarkdown}
          masteryBullets={masteryBullets(competency)}
          commonMistakeMarkdown={competency.commonMistakeMarkdown}
          toolkitTags={toolkitTags(competency)}
          inPracticeBullets={inPracticeBullets(competency)}
          toolkitDocs={toolkitDocs}
          inputArtifacts={artifacts.inputs}
          outputArtifacts={artifacts.outputs}
          outputArtifactsTruncatedCount={artifacts.outputsTruncatedCount}
          exercises={competency.exercises.map((ex) => ({
            id: ex.id,
            number: ex.number,
            title: ex.title,
            durationLabel: ex.durationLabel,
            howToSteps: howToSteps(ex),
            status: statusByExercise.get(ex.id) ?? "not_started",
            missionMarkdown: ex.missionMarkdown,
            projectNames: ex.projects.map((p) => p.displayName),
            evidenceCount: evidenceChecklist(ex).length,
          }))}
        />
      </div>
    </main>
  );
}
