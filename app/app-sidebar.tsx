import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { competencyStyle } from "@/lib/competency-style";

// Persistent left nav for the learner shell only — proxy.ts already
// guarantees a session exists before this renders. Mirrors the same
// passed/total-per-competency shape as app/dashboard/page.tsx and
// lib/roster.ts, just as a compact always-visible list instead of a grid.
// Purely learner-facing: Roster/Users live in app/admin/AdminSidebar.tsx
// instead, so this never shows a facilitator's own (meaningless)
// personal progress mixed in with real reviewer tooling. A facilitator
// does still see this exact sidebar when they deliberately switch to
// "Learner view" (RoleViewSwitcher) — that's the point, it's the real
// learner experience, not a different, hybrid one.
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

  const roles = session?.user.roles ?? [];
  const isAdminIsh =
    roles.includes("facilitator") || roles.includes("company_admin") || roles.includes("super_admin");
  const backHref =
    roles.includes("facilitator") || roles.includes("super_admin") ? "/admin/roster" : "/admin/users";

  return (
    <aside className="h-full w-full border-r border-line bg-canvas-subtle px-3 py-6">
      {isAdminIsh && (
        // Guaranteed reachable on every screen size, unlike AppHeader's
        // RoleViewSwitcher (hidden below md:) — an admin/reviewer
        // previewing as learner always has a way back, mobile drawer
        // included. docs/features/0019-multi-role.md.
        <Link
          href={backHref}
          className="mb-4 flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-fg-muted hover:border-fg-subtle hover:text-fg"
        >
          ← Back to Reviewer view
        </Link>
      )}
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
          My Progress
        </Link>
        <Link
          href="/account"
          className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
        >
          Profile
        </Link>
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
