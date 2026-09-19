import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = Number(session!.user.id);

  const [competencies, submissions, mostRecentInProgress] = await Promise.all([
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

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Welcome back, {session!.user.name}
        </h1>
        <span className="text-sm text-fg-muted">Overall: {overallPct}%</span>
      </div>

      {mostRecentInProgress && (
        <Link
          href={`/competencies/${mostRecentInProgress.exercise.competency.number}/exercises/${mostRecentInProgress.exercise.number}`}
          className="mt-6 block rounded-xl border border-line bg-canvas-subtle p-5 hover:border-fg-subtle"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Continue where you left off
          </p>
          <p className="mt-2 font-medium text-fg">
            {String(mostRecentInProgress.exercise.competency.number).padStart(2, "0")}{" "}
            · {mostRecentInProgress.exercise.competency.title} → Ex{" "}
            {String(mostRecentInProgress.exercise.number).padStart(2, "0")}{" "}
            {mostRecentInProgress.exercise.title}
          </p>
        </Link>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Competencies
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {competencies.map((c) => {
            const passed = c.exercises.filter(
              (ex) => statusByExercise.get(ex.id) === "passed",
            ).length;
            return (
              <Link
                key={c.id}
                href={`/competencies/${c.number}`}
                className="rounded-lg border border-line bg-canvas-subtle p-4 hover:border-fg-subtle"
              >
                <div className="font-mono text-xs text-fg-subtle">
                  {String(c.number).padStart(2, "0")}
                </div>
                <div className="mt-1 text-sm font-medium text-fg">{c.title}</div>
                <div className="mt-2 text-xs text-fg-muted">
                  {passed}/{c.exercises.length}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
