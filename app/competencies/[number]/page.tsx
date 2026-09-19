import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { masteryBullets, toolkitTags } from "@/lib/content";
import { StatusBadge } from "@/app/status-badge";

export const dynamic = "force-dynamic";

export default async function CompetencyPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const competency = await prisma.competency.findUnique({
    where: { number: Number(number) },
    include: { exercises: { orderBy: { number: "asc" } } }, // fixed 01→04
  });

  if (!competency) notFound();

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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/competencies" className="text-sm font-medium text-accent hover:underline">
        ← All competencies
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-fg">
        {String(competency.number).padStart(2, "0")} · {competency.title}
      </h1>
      <p className="mt-1 text-fg-muted">{competency.subtitle}</p>

      <section className="mt-8 space-y-6 rounded-xl border border-line bg-canvas-subtle p-7">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">
            The Shift
          </h2>
          <p className="mt-2 leading-relaxed text-fg">
            {competency.shiftMarkdown}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-line pt-5 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-success-fg">
              ✓ What mastery looks like
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-fg">
              {masteryBullets(competency).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-attention-fg">
              ⚠ Common mistake to avoid
            </h3>
            <p className="mt-2 text-sm text-fg">
              {competency.commonMistakeMarkdown}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line pt-5">
          {toolkitTags(competency).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-line bg-canvas px-3 py-1 text-xs font-medium text-fg-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Exercises in this competency
        </h2>
        <ol className="flex flex-col gap-2">
          {competency.exercises.map((ex) => (
            <li key={ex.id}>
              <Link
                href={`/competencies/${competency.number}/exercises/${ex.number}`}
                className="flex items-center justify-between rounded-lg border border-line bg-canvas-subtle px-5 py-3 hover:border-fg-subtle"
              >
                <span className="flex items-center gap-4">
                  <span className="font-mono text-sm text-accent">
                    {String(ex.number).padStart(2, "0")}
                  </span>
                  <span className="font-medium text-fg">{ex.title}</span>
                </span>
                <span className="flex items-center gap-3 text-sm text-fg-muted">
                  {ex.durationLabel}
                  <StatusBadge
                    status={statusByExercise.get(ex.id) ?? "not_started"}
                  />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
