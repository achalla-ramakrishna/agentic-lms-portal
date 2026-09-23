import Link from "next/link";

// Facilitator/company_admin nav (gated by app/admin/layout.tsx) —
// deliberately does NOT include AppSidebar's
// Dashboard/My Progress links or the per-competency personal-progress
// list: a reviewer's own "0/3 passed" on every competency is meaningless
// noise, not useful nav. Keeping this as its own component (rather than
// more role-conditionals bolted onto AppSidebar) is the actual fix for
// "learner and reviewer functionality all mixed up" — two shells with
// two purposes, not one shell hiding/showing pieces of itself.
export function AdminSidebar() {
  return (
    <aside className="h-full w-full border-r border-line bg-canvas-subtle px-3 py-6">
      <nav className="flex flex-col gap-0.5 text-sm">
        <Link
          href="/admin/roster"
          className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
        >
          Roster
        </Link>
        <Link
          href="/admin/company"
          className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
        >
          Company Dashboard
        </Link>
        <Link
          href="/admin/learners"
          className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
        >
          Learner Dashboards
        </Link>
        <Link
          href="/admin/users"
          className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
        >
          Users
        </Link>
        <Link
          href="/admin/settings"
          className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
        >
          Company Settings
        </Link>
        <Link
          href="/account"
          className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
        >
          Profile
        </Link>
      </nav>
    </aside>
  );
}
