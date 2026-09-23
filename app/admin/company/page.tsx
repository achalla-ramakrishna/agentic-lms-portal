import { forbidden } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/current-user";
import { resolveEffectiveCompany, parseCompanyIdParam } from "@/lib/company-scope";
import { companyOverview } from "@/lib/company-stats";
import { ProgressRing } from "@/app/(app)/dashboard/ProgressRing";
import { StatusDonut } from "@/app/(app)/dashboard/StatusDonut";
import { CompetencyBarChart } from "@/app/(app)/dashboard/CompetencyBarChart";

export const dynamic = "force-dynamic";

// facilitator/super_admin only — same review-side visibility as Roster
// (docs/features/0018-role-separation.md, 0019-multi-role.md). The
// aggregate view a company owner actually wants — reuses the exact
// chart components the individual learner dashboard already renders
// (docs/features/0015-companies-roles.md), just fed company-wide
// aggregated data instead of one learner's.
export default async function CompanyDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { companyId: companyIdParam } = await searchParams;
  const currentUser = await requireCurrentUser();
  if (!currentUser.roles.includes("facilitator") && !currentUser.roles.includes("super_admin")) {
    forbidden();
  }
  const company = await resolveEffectiveCompany(currentUser, parseCompanyIdParam(companyIdParam));
  const companyId = company.id;

  const [learners, competencies, submissions] = await Promise.all([
    prisma.user.findMany({
      where: { role: "learner", companyId },
      select: { id: true },
    }),
    prisma.competency.findMany({
      orderBy: { number: "asc" }, // fixed 01→12 — docs/SPEC.md §4
      select: { number: true, title: true, exercises: { select: { id: true } } },
    }),
    prisma.submission.findMany({
      where: { user: { companyId } },
      select: { exerciseId: true, status: true },
    }),
  ]);

  const overview = companyOverview(
    learners.length,
    submissions,
    competencies.map((c) => ({
      number: c.number,
      title: c.title,
      exerciseIds: c.exercises.map((e) => e.id),
    })),
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">
        {company.name} — Company Dashboard
      </h1>
      <p className="mt-1 text-sm text-fg-muted">
        Aggregate progress across every learner at {company.name}.
      </p>

      <div className="mt-8 flex flex-col items-center gap-8 rounded-2xl border border-line bg-canvas-subtle p-6 sm:flex-row">
        <ProgressRing pct={overview.overallPct} />
        <div className="flex-1">
          <p className="border-l-4 border-success-fg pl-4 text-base font-semibold text-fg">
            {overview.learnerCount} learner{overview.learnerCount === 1 ? "" : "s"} across
            the curriculum.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatTile label="Learners" value={String(overview.learnerCount)} />
            <StatTile
              label="Exercises passed"
              value={String(overview.counts.passed)}
            />
            <StatTile
              label="Pending review"
              value={String(overview.counts.submitted)}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-canvas-subtle p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Status breakdown
          </h2>
          <StatusDonut counts={overview.counts} />
        </section>
        <section className="rounded-2xl border border-line bg-canvas-subtle p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Progress by competency
          </h2>
          <CompetencyBarChart competencies={overview.competencyProgress} />
        </section>
      </div>
    </main>
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
