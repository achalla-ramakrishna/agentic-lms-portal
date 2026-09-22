import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { LearnerDashboardView } from "@/app/(app)/dashboard/LearnerDashboardView";
import { LearnerPicker } from "@/app/admin/learners/LearnerPicker";

export const dynamic = "force-dynamic";

// Role gate is app/admin/layout.tsx (facilitator-only) — this page just
// trusts it, same as every other page under app/admin/**.
export default async function LearnerDashboardPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: userIdParam } = await params;
  const userId = Number(userIdParam);

  const [learner, learners] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, role: "learner" },
      select: { id: true, name: true },
    }),
    prisma.user.findMany({
      where: { role: "learner" },
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
