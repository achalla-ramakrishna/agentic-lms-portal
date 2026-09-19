import Link from "next/link";
import { prisma } from "@/lib/db";
import { COMPETENCY_ICON, competencyStyle } from "@/lib/competency-style";

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
      <Link href="/" className="text-sm font-medium text-accent hover:underline">
        ← Home
      </Link>
      <h1 className="mt-4 mb-8 text-2xl font-semibold tracking-tight text-fg">
        Competencies
      </h1>
      <ol className="flex flex-col gap-3">
        {competencies.map((c) => (
          <li key={c.id}>
            <Link
              href={`/competencies/${c.number}`}
              className="flex items-center justify-between rounded-lg border-l-2 border-line bg-canvas-subtle px-5 py-4 hover:border-fg-subtle"
              style={{ borderLeftColor: competencyStyle(c.number).border }}
            >
              <span className="flex items-center gap-4">
                <span aria-hidden="true">{COMPETENCY_ICON[c.number]}</span>
                <span className="font-mono text-sm text-fg-subtle">
                  {String(c.number).padStart(2, "0")}
                </span>
                <span className="font-medium text-fg">{c.title}</span>
              </span>
              <span className="text-sm text-fg-muted">
                {c._count.exercises} exercises
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
