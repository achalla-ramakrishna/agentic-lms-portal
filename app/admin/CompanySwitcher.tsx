"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// super_admin-only — lets them pick which company's Roster/Users/
// Company Dashboard/Company Settings they're currently looking at, via
// a ?companyId= query param on whichever /admin/** page they're on
// (read directly by that page's own searchParams — see
// lib/company-scope.ts). Pure client-side navigation, no server
// action/cookie involved: an earlier cookie-based version silently
// failed because the app's proxy.ts middleware matches /admin/:path*,
// which is also the server action's own POST target, and dropped the
// Set-Cookie header. A query param sidesteps that entirely — same
// on-change-navigate pattern as LearnerPicker/RoleViewSwitcher, which
// don't have this problem for the same reason. See docs/features/
// 0018-role-separation.md.
export function CompanySwitcher({
  companies,
  defaultCompanyId,
}: {
  companies: { id: number; name: string }[];
  defaultCompanyId: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = Number(searchParams.get("companyId")) || defaultCompanyId;

  return (
    <select
      value={selectedId}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("companyId", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-md border border-line bg-canvas-inset px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none"
    >
      {companies.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
