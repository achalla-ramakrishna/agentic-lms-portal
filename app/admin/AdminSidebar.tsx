"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Role } from "@prisma/client";

const REVIEW_LINKS = [
  { href: "/admin/roster", label: "Roster" },
  { href: "/admin/company", label: "Company Dashboard" },
  { href: "/admin/learners", label: "Learner Dashboards" },
];

const MANAGE_LINKS = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Company Settings" },
];

// Nav is role-gated, not just page-gated — the actual capability check
// still lives on each page/action (the source of truth), but showing a
// link a role can't use would be its own kind of confusing "mixed up"
// nav, the exact complaint 0013-role-separation.md fixed for learner
// vs. reviewer. Shows the *union* of every capability this account's
// role set grants (docs/features/0019-multi-role.md) — a company_admin
// who's also a facilitator genuinely sees both groups at once, same as
// super_admin already did before multi-role existed; there's no
// separate "mode" to switch, the ViewSwitcher in the header is just a
// shortcut to jump straight to one section.
//
// A client component (not the server component it started as) so its
// links can carry forward the current ?companyId= — a super_admin
// switching companies would otherwise lose that selection the moment
// they click a plain <Link> to another /admin/** page.
export function AdminSidebar({ roles }: { roles: Role[] }) {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const withCompanyId = (href: string) =>
    companyId ? `${href}?companyId=${companyId}` : href;

  const showReviewLinks = roles.includes("facilitator") || roles.includes("super_admin");
  const showManageLinks = roles.includes("company_admin") || roles.includes("super_admin");

  return (
    <aside className="h-full w-full border-r border-line bg-canvas-subtle px-3 py-6">
      <nav className="flex flex-col gap-0.5 text-sm">
        {showReviewLinks &&
          REVIEW_LINKS.map((link) => (
            <Link
              key={link.href}
              href={withCompanyId(link.href)}
              className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
        {showManageLinks &&
          MANAGE_LINKS.map((link) => (
            <Link
              key={link.href}
              href={withCompanyId(link.href)}
              className="rounded-md px-3 py-1.5 font-medium text-fg hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
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
