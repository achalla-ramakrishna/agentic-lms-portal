import { forbidden, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/current-user";
import { resolveEffectiveCompany, parseCompanyIdParam } from "@/lib/company-scope";
import { LearnerDashboardView } from "@/app/(app)/dashboard/LearnerDashboardView";
import { LearnerPicker } from "@/app/admin/learners/LearnerPicker";

export const dynamic = "force-dynamic";

// facilitator/super_admin only (docs/features/0018-role-separation.md,
// 0019-multi-role.md) — role gate is otherwise app/admin/layout.tsx,
// which only checks "some kind of admin"; this page enforces the
// specific review-side split.
export default async function LearnerDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { userId: userIdParam } = await params;
  const { companyId: companyIdParam } = await searchParams;
  const userId = Number(userIdParam);
  const currentUser = await requireCurrentUser();
  if (!currentUser.roles.includes("facilitator") && !currentUser.roles.includes("super_admin")) {
    forbidden();
  }
  const company = await resolveEffectiveCompany(currentUser, parseCompanyIdParam(companyIdParam));

  const [learner, learners] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, role: "learner", companyId: company.id },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { role: "learner", companyId: company.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!learner) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Learner Dashboard
        </p>
        <LearnerPicker learners={learners} selectedId={learner.id} />
      </div>

      <div className="mt-4">
        <LearnerDashboardView
          userId={learner.id}
          heading={`${learner.name}'s Dashboard`}
          subheading="Progress snapshot, as seen by the reviewer."
        />
      </div>
    </main>
  );
}
