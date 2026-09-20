import Link from "next/link";

// Overrides the root forbidden.tsx for this route segment (Next's
// authInterrupts resolves forbidden() to the nearest forbidden.tsx up the
// tree) — the root page's "facilitators only" message is wrong here: a
// submission page blocks either because it's someone else's submission
// (ownership check) or, rarely, because a facilitator's decision form
// went stale (another facilitator decided it first). Neither is a role
// problem, so this doesn't claim to be one.
export default function SubmissionForbidden() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-fg">403 — Not available to you</h1>
      <p className="text-fg-muted">
        This submission isn&apos;t yours to view, or it&apos;s already been
        decided.
      </p>
      <Link href="/dashboard" className="text-sm font-medium text-accent hover:underline">
        Back to dashboard
      </Link>
    </main>
  );
}
