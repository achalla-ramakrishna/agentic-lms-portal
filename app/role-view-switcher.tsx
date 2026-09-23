"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Role } from "@prisma/client";

const VIEW_OPTIONS: { role: Role | "learner"; value: string; label: string; href: string }[] = [
  { role: "facilitator", value: "reviewer", label: "Reviewer view", href: "/admin/roster" },
  { role: "company_admin", value: "company_admin", label: "Company Admin view", href: "/admin/users" },
  { role: "learner", value: "learner", label: "Learner view", href: "/dashboard" },
];

// Only offers the views this account's actual role set grants — a
// plain single-role account still never sees this (no self-service
// privilege confusion), but an account holding several roles at once
// (docs/features/0019-multi-role.md — e.g. a company_admin who's also
// a facilitator) gets a real toggle between all of them, not just the
// old two-way Reviewer/Learner choice. super_admin gets every option.
// Pure navigation, same as before — the underlying permissions are the
// account's full role set regardless of which option is currently
// selected; picking one is just "jump to that section."
export function RoleViewSwitcher({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const pathname = usePathname();

  const options = VIEW_OPTIONS.filter(
    (opt) => opt.role === "learner" || roles.includes(opt.role) || roles.includes("super_admin"),
  );
  if (options.length < 2) return null;

  // Derived from the real current path, not a value guessed by whatever
  // server component rendered this — a stale/hardcoded value here once
  // meant re-selecting the option already showing didn't fire onChange
  // at all (the <select> was already at that value), silently no-oping
  // the whole switcher for a dual-role user landing on their non-default
  // section. Falls back to the first option's value if the current path
  // matches none of them (e.g. on /admin/company or /admin/learners).
  const current =
    options.find((o) => pathname.startsWith(o.href))?.value ?? options[0].value;

  return (
    <select
      value={current}
      onChange={(e) => {
        const target = options.find((o) => o.value === e.target.value);
        if (target) router.push(target.href);
      }}
      aria-label="Switch view"
      className="rounded-md border border-line bg-canvas-inset px-2 py-1 text-sm font-medium text-fg hover:border-fg-subtle focus:border-accent focus:outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
