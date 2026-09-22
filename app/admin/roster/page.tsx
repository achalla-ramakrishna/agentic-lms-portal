import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildRoster, pendingSubmissions } from "@/lib/roster";
import { templateCoverage } from "@/lib/template-coverage";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const competencies = await prisma.competency.findMany({
    orderBy: { number: "asc" }, // fixed 01→12 — docs/SPEC.md §4
    select: { number: true },
  });
  const [roster, pending, coverage] = await Promise.all([
    buildRoster(),
    pendingSubmissions(),
    templateCoverage(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Roster</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-canvas-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-fg-muted">
              <th className="px-4 py-3">Learner</th>
              {competencies.map((c) => (
                <th key={c.number} className="px-2 py-3 text-center">
                  {String(c.number).padStart(2, "0")}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Overall</th>
              <th className="px-4 py-3 text-right">Pending</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((row) => (
              <tr key={row.userId} className="border-b border-line-muted">
                <td className="px-4 py-3 font-medium text-fg">
                  <Link
                    href={`/admin/learners/${row.userId}`}
                    className="hover:text-accent hover:underline"
                  >
                    {row.name}
                  </Link>
                </td>
                {competencies.map((c) => {
                  const cell = row.perCompetency.get(c.number);
                  return (
                    <td
                      key={c.number}
                      className="px-2 py-3 text-center text-fg-muted"
                    >
                      {cell ? `${cell.passed}/${cell.total}` : "—"}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right text-fg">
                  {row.totalExercises === 0
                    ? "0%"
                    : `${Math.round((row.passedCount / row.totalExercises) * 100)}%`}
                </td>
                <td className="px-4 py-3 text-right">
                  {row.pendingCount > 0 ? (
                    <span className="rounded-full border border-attention-fg/40 bg-attention-fg/10 px-2.5 py-0.5 font-medium text-attention-fg">
                      {row.pendingCount}
                    </span>
                  ) : (
                    <span className="text-fg-subtle">0</span>
                  )}
                </td>
              </tr>
            ))}
            {roster.length === 0 && (
              <tr>
                <td
                  colSpan={competencies.length + 3}
                  className="px-4 py-6 text-center text-fg-subtle"
                >
                  No learners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-fg-subtle">Nothing pending review.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pending.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/submissions/${p.id}`}
                  className="flex items-center justify-between rounded-lg border border-line bg-canvas-subtle px-5 py-3 hover:border-fg-subtle"
                >
                  <span className="text-fg">
                    {p.learnerName} —{" "}
                    {String(p.competencyNumber).padStart(2, "0")}.
                    {String(p.exerciseNumber).padStart(2, "0")} {p.exerciseTitle}
                  </span>
                  <span className="text-sm font-medium text-accent">
                    Review →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Available Templates
        </h2>
        <p className="mb-3 text-xs text-fg-subtle">
          Real evidence templates and contract docs pulled from the
          exercise-set repo, by competency — reference this before pointing
          a learner at &ldquo;Templates &amp; Guidelines&rdquo; on a
          competency or exercise page.
        </p>
        <div className="overflow-x-auto rounded-xl border border-line bg-canvas-subtle">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-fg-muted">
                <th className="px-4 py-3">Competency</th>
                <th className="px-2 py-3 text-center">Exercises w/ templates</th>
                <th className="px-4 py-3 text-right">Total templates</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map((c) => (
                <tr key={c.number} className="border-b border-line-muted">
                  <td className="px-4 py-3">
                    <Link
                      href={`/competencies/${c.number}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {String(c.number).padStart(2, "0")} {c.title}
                    </Link>
                  </td>
                  <td className="px-2 py-3 text-center text-fg-muted">
                    {c.exercisesWithDocs}/{c.exerciseCount}
                  </td>
                  <td className="px-4 py-3 text-right text-fg">
                    {c.totalDocs}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
