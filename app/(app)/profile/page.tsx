import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/app/status-badge";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = Number(session!.user.id);

  const [competencies, submissions] = await Promise.all([
    prisma.competency.findMany({
      orderBy: { number: "asc" }, // fixed 01→12 — docs/SPEC.md §4
      include: { exercises: { orderBy: { number: "asc" } } },
    }),
    prisma.submission.findMany({
      where: { userId },
      select: { exerciseId: true, status: true, id: true },
    }),
  ]);

  const submissionByExercise = new Map(
    submissions.map((s) => [s.exerciseId, s]),
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">
        {session!.user.name}&apos;s progress
      </h1>
      <p className="mt-1 text-sm text-fg-muted">
        Every exercise across all 12 competencies.
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {competencies.map((c) => (
          <section key={c.id}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">
              {String(c.number).padStart(2, "0")} · {c.title}
            </h2>
            <ul className="flex flex-col gap-1">
              {c.exercises.map((ex) => {
                const submission = submissionByExercise.get(ex.id);
                const status = submission?.status ?? "not_started";
                const href = submission
                  ? `/submissions/${submission.id}`
                  : `/competencies/${c.number}/exercises/${ex.number}`;
                return (
                  <li key={ex.id}>
                    <Link
                      href={href}
                      className="flex items-center justify-between rounded-md border border-line bg-canvas-subtle px-4 py-2 text-sm text-fg hover:border-fg-subtle"
                    >
                      <span>
                        <span className="text-fg-subtle">
                          {String(ex.number).padStart(2, "0")}
                        </span>{" "}
                        {ex.title}
                      </span>
                      <StatusBadge status={status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
