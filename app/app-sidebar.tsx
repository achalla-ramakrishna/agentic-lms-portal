import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { competencyStyle } from "@/lib/competency-style";

// Persistent left nav for every session-protected page — proxy.ts already
// guarantees a session exists before this renders. Mirrors the same
// passed/total-per-competency shape as app/dashboard/page.tsx and
// lib/roster.ts, just as a compact always-visible list instead of a grid.
export async function AppSidebar() {
  const session = await getServerSession(authOptions);
  const userId = Number(session!.user.id);

  const [competencies, submissions] = await Promise.all([
    prisma.competency.findMany({
      orderBy: { number: "asc" }, // fixed 01→12 — docs/SPEC.md §4
      include: { exercises: { select: { id: true } } },
    }),
    prisma.submission.findMany({
      where: { userId },
      select: { exerciseId: true, status: true },
    }),
  ]);

  const passedExerciseIds = new Set(
    submissions.filter((s) => s.status === "passed").map((s) => s.exerciseId),
  );

  return (
    <aside className="w-64 shrink-0 border-r border-line bg-canvas-subtle px-3 py-6">
      <nav className="flex flex-col gap-0.5 text-sm">
        <Link
          href="/dashboard"
          className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
        >
          Dashboard
        </Link>
        <Link
          href="/profile"
          className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
        >
          Profile
        </Link>
        {session?.user.role === "facilitator" && (
          <>
            <Link
              href="/admin/roster"
              className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
            >
              Roster
            </Link>
            <Link
              href="/admin/users"
              className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
            >
              Users
            </Link>
          </>
        )}
      </nav>

      <div className="mt-6">
        <h2 className="px-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Competencies
        </h2>
        <nav className="mt-2 flex flex-col gap-0.5">
          {competencies.map((c) => {
            const passed = c.exercises.filter((ex) =>
              passedExerciseIds.has(ex.id),
            ).length;
            return (
              <Link
                key={c.id}
                href={`/competencies/${c.number}`}
                className="flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-sm text-fg hover:bg-white/5"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: competencyStyle(c.number).border }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs text-fg-subtle">
                    {String(c.number).padStart(2, "0")}
                  </span>
                  <span className="truncate">{c.title}</span>
                </span>
                <span className="shrink-0 text-xs text-fg-muted">
                  {passed}/{c.exercises.length}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
