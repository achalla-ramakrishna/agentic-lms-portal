import Link from "next/link";
import { prisma } from "@/lib/db";
import { statusBreakdown, progressMessage, daysSince } from "@/lib/dashboard-stats";
import { CompetencyGrid } from "./CompetencyGrid";
import { ProgressRing } from "./ProgressRing";
import { StatusDonut } from "./StatusDonut";
import { CompetencyBarChart } from "./CompetencyBarChart";

// Shared by app/(app)/dashboard/page.tsx (a learner viewing their own
// progress) and app/admin/learners/[userId]/page.tsx (a reviewer viewing a
// specific learner's progress) — same data, same charts, only the
// surrounding heading text differs, passed in rather than hardcoded here.
export async function LearnerDashboardView({
  userId,
  heading,
  subheading,
}: {
  userId: number;
  heading: string;
  subheading: string;
}) {
  const [competencies, submissions, mostRecentInProgress, evidenceCount, firstStarted] =
    await Promise.all([
      prisma.competency.findMany({
        orderBy: { number: "asc" }, // fixed 01→12 — docs/SPEC.md §4
        include: { exercises: { orderBy: { number: "asc" } } },
      }),
      prisma.submission.findMany({
        where: { userId },
        select: { exerciseId: true, status: true },
      }),
      prisma.submission.findFirst({
        where: { userId, status: "in_progress" },
        orderBy: { startedAt: "desc" },
        include: { exercise: { include: { competency: true } } },
      }),
      prisma.evidenceArtifact.count({
        where: { submission: { userId } },
      }),
      prisma.submission.aggregate({
        where: { userId, startedAt: { not: null } },
        _min: { startedAt: true },
      }),
    ]);

  const statusByExercise = new Map(
    submissions.map((s) => [s.exerciseId, s.status]),
  );

  const totalExercises = competencies.reduce(
    (sum, c) => sum + c.exercises.length,
    0,
  );
  const passedCount = submissions.filter((s) => s.status === "passed").length;
  const overallPct =
    totalExercises === 0 ? 0 : Math.round((passedCount / totalExercises) * 100);
  const counts = statusBreakdown(submissions, totalExercises);
  const completedCompetencies = competencies.filter(
    (c) =>
      c.exercises.length > 0 &&
      c.exercises.every((ex) => statusByExercise.get(ex.id) === "passed"),
  ).length;
  const dayNumber = firstStarted._min.startedAt
    ? daysSince(firstStarted._min.startedAt, new Date()) + 1
    : null;
  const competencyProgress = competencies.map((c) => ({
    number: c.number,
    title: c.title,
    passed: c.exercises.filter((ex) => statusByExercise.get(ex.id) === "passed")
      .length,
    total: c.exercises.length,
  }));

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-fg">{heading}</h1>
      <p className="mt-1 text-sm text-fg-muted">{subheading}</p>

      <div className="mt-8 flex flex-col items-center gap-8 rounded-2xl border border-line bg-canvas-subtle p-6 sm:flex-row">
        <ProgressRing pct={overallPct} />
        <div className="flex-1">
          <p className="border-l-4 border-success-fg pl-4 text-base font-semibold text-fg">
            {progressMessage(overallPct)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Exercises passed" value={`${passedCount}/${totalExercises}`} />
            <StatTile label="Competencies completed" value={`${completedCompetencies}/12`} />
            <StatTile label="Evidence submitted" value={String(evidenceCount)} />
            <StatTile
              label="Journey"
              value={dayNumber ? `Day ${dayNumber}` : "Not started"}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-canvas-subtle p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Status breakdown
          </h2>
          <StatusDonut counts={counts} />
        </section>
        <section className="rounded-2xl border border-line bg-canvas-subtle p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Progress by competency
          </h2>
          <CompetencyBarChart competencies={competencyProgress} />
        </section>
      </div>

      {mostRecentInProgress && (
        <Link
          href={`/competencies/${mostRecentInProgress.exercise.competency.number}/exercises/${mostRecentInProgress.exercise.number}`}
          className="mt-8 block rounded-xl border border-line bg-canvas-subtle p-5 hover:border-fg-subtle"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Currently in progress
          </p>
          <p className="mt-2 font-medium text-fg">
            {String(mostRecentInProgress.exercise.competency.number).padStart(2, "0")}{" "}
            · {mostRecentInProgress.exercise.competency.title} → Ex{" "}
            {String(mostRecentInProgress.exercise.number).padStart(2, "0")}{" "}
            {mostRecentInProgress.exercise.title}
          </p>
        </Link>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Competencies
        </h2>
        <CompetencyGrid competencies={competencyProgress} />
      </section>
    </>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-canvas-inset px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-fg-muted">
        {label}
      </p>
      <p className="mt-0.5 text-2xl font-semibold text-fg">{value}</p>
    </div>
  );
}
