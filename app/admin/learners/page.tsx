import { forbidden, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/current-user";
import { resolveEffectiveCompany, parseCompanyIdParam } from "@/lib/company-scope";

export const dynamic = "force-dynamic";

// facilitator/super_admin only (docs/features/0018-role-separation.md,
// 0019-multi-role.md). Entry point for the "Learner Dashboards" nav
// link — always useful rather than an empty landing page, so it drops
// straight into the first learner (alphabetically, matching
// LearnerPicker's order) instead of making the reviewer pick one first.
export default async function LearnerDashboardsIndexPage({
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
  const firstLearner = await prisma.user.findFirst({
    where: { role: "learner", companyId: company.id },
    orderBy: { name: "asc" },
    select: { id: true },
  });

  if (!firstLearner) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm text-fg-subtle">No learners yet.</p>
      </main>
    );
  }

  redirect(
    companyIdParam
      ? `/admin/learners/${firstLearner.id}?companyId=${companyIdParam}`
      : `/admin/learners/${firstLearner.id}`,
  );
}
