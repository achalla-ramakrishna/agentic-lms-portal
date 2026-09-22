"use client";

import { useRouter } from "next/navigation";

// Client component so switching learners doesn't require going back to
// Roster and clicking through again — matches how RoleViewSwitcher
// (app/role-view-switcher.tsx) navigates on change rather than submitting
// a form.
export function LearnerPicker({
  learners,
  selectedId,
}: {
  learners: { id: number; name: string }[];
  selectedId: number;
}) {
  const router = useRouter();

  return (
    <select
      value={selectedId}
      onChange={(e) => router.push(`/admin/learners/${e.target.value}`)}
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
