import Link from "next/link";
import { prisma } from "@/lib/db";

// DB-backed content that changes via `npm run db:seed`, not a rebuild —
// don't let Next prerender this at build time (also means `next build`
// doesn't require a migrated DB to succeed).
export const dynamic = "force-dynamic";

export default async function CompetenciesPage() {
  const competencies = await prisma.competency.findMany({
    orderBy: { number: "asc" }, // fixed 01→12, never re-sorted — docs/SPEC.md §4
    include: { _count: { select: { exercises: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/" className="text-sm font-medium">
        ← Home
      </Link>
      <h1 className="mt-4 mb-8 text-2xl font-semibold tracking-tight">
        Competencies
      </h1>
      <ol className="flex flex-col gap-3">
        {competencies.map((c) => (
          <li key={c.id}>
            <Link
              href={`/competencies/${c.number}`}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-5 py-4 hover:border-neutral-400"
            >
              <span className="flex items-center gap-4">
                <span className="font-mono text-sm text-neutral-400">
                  {String(c.number).padStart(2, "0")}
                </span>
                <span className="font-medium">{c.title}</span>
              </span>
              <span className="text-sm text-neutral-500">
                {c._count.exercises} exercises
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
