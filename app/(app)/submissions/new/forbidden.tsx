import Link from "next/link";

// Overrides the root forbidden.tsx for this route segment. The page
// itself now blocks a locked (submitted/passed) exercise before the form
// ever renders (see page.tsx), so this is only reachable as a defense-in-
// depth fallback — e.g. a stale tab submitting after a facilitator
// already decided it elsewhere. Whatever the exact trigger, it's a
// status problem, not a role problem, so it doesn't say "facilitators
// only."
export default function SubmitForbidden() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-fg">403 — Not available to you</h1>
      <p className="text-fg-muted">
        This exercise&apos;s submission can&apos;t be edited anymore — it&apos;s
        already been submitted or reviewed.
      </p>
      <Link href="/dashboard" className="text-sm font-medium text-accent hover:underline">
        Back to dashboard
      </Link>
    </main>
  );
}
