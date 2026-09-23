"use client";

import { useRouter, useSearchParams } from "next/navigation";

// Client component so switching learners doesn't require going back to
// Roster and clicking through again — matches how RoleViewSwitcher
// (app/role-view-switcher.tsx) navigates on change rather than submitting
// a form. Preserves ?companyId= (super_admin's CompanySwitcher selection,
// docs/features/0019-multi-role.md) so switching learners doesn't
// silently jump back to the viewer's own default company.
export function LearnerPicker({
  learners,
  selectedId,
}: {
  learners: { id: number; name: string }[];
  selectedId: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      value={selectedId}
      onChange={(e) => {
        const companyId = searchParams.get("companyId");
        const target = `/admin/learners/${e.target.value}`;
        router.push(companyId ? `${target}?companyId=${companyId}` : target);
      }}
      className="rounded-md border border-line bg-canvas-inset px-3 py-1.5 text-sm text-fg focus:border-accent focus:outline-none"
    >
      {learners.map((l) => (
        <option key={l.id} value={l.id}>
          {l.name}
        </option>
      ))}
    </select>
  );
}
