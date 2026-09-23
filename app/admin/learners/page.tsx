import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

// Entry point for the "Learner Dashboards" nav link — always useful rather
// than an empty landing page, so it drops straight into the first learner
// (alphabetically, matching LearnerPicker's order) instead of making the
// reviewer pick one first.
export default async function LearnerDashboardsIndexPage() {
  const currentUser = await requireCurrentUser();
  const firstLearner = await prisma.user.findFirst({
    where: { role: "learner", companyId: currentUser.companyId },
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

  redirect(`/admin/learners/${firstLearner.id}`);
}
