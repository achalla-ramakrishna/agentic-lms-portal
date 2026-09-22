import { requireCurrentUser } from "@/lib/current-user";
import { LearnerDashboardView } from "./LearnerDashboardView";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <LearnerDashboardView
        userId={user.id}
        heading={`Welcome back, ${user.name}`}
        subheading="Here's your snapshot."
      />
    </main>
  );
}
