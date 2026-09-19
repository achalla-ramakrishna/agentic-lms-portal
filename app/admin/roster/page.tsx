import Link from "next/link";
import { prisma } from "@/lib/db";
import { buildRoster, pendingSubmissions } from "@/lib/roster";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const competencies = await prisma.competency.findMany({
    orderBy: { number: "asc" }, // fixed 01→12 — docs/SPEC.md §4
    select: { number: true },
  });
  const [roster, pending] = await Promise.all([
    buildRoster(),
    pendingSubmissions(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Roster</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
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
              <tr key={row.userId} className="border-b border-neutral-100">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                {competencies.map((c) => {
                  const cell = row.perCompetency.get(c.number);
                  return (
                    <td
                      key={c.number}
                      className="px-2 py-3 text-center text-neutral-500"
                    >
                      {cell ? `${cell.passed}/${cell.total}` : "—"}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right">
                  {row.totalExercises === 0
                    ? "0%"
                    : `${Math.round((row.passedCount / row.totalExercises) * 100)}%`}
                </td>
                <td className="px-4 py-3 text-right">
                  {row.pendingCount > 0 ? (
                    <span className="rounded-md bg-orange-100 px-2 py-0.5 font-medium text-orange-800">
                      {row.pendingCount}
                    </span>
                  ) : (
                    <span className="text-neutral-300">0</span>
                  )}
                </td>
              </tr>
            ))}
            {roster.length === 0 && (
              <tr>
                <td
                  colSpan={competencies.length + 3}
                  className="px-4 py-6 text-center text-neutral-400"
                >
                  No learners yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-neutral-400">Nothing pending review.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {pending.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/submissions/${p.id}`}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-5 py-3 hover:border-neutral-400"
                >
                  <span>
                    {p.learnerName} —{" "}
                    {String(p.competencyNumber).padStart(2, "0")}.
                    {String(p.exerciseNumber).padStart(2, "0")} {p.exerciseTitle}
                  </span>
                  <span className="text-sm font-medium underline">
                    Review →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
