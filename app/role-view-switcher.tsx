"use client";

import { useRouter } from "next/navigation";

// Facilitator-only — a plain learner account never has a second role to
// switch into, so this never renders for them (no self-service privilege
// confusion). A deliberate, labeled way to preview the learner
// experience, replacing the old ambient "Learner view" / "Admin" links
// that made both shells look like one mixed-together nav.
export function RoleViewSwitcher({ current }: { current: "learner" | "reviewer" }) {
  const router = useRouter();

  return (
    <select
      value={current}
      onChange={(e) => {
        router.push(e.target.value === "reviewer" ? "/admin/roster" : "/dashboard");
      }}
      aria-label="Switch view"
      className="rounded-md border border-line bg-canvas-inset px-2 py-1 text-sm font-medium text-fg hover:border-fg-subtle focus:border-accent focus:outline-none"
    >
      <option value="reviewer">Reviewer view</option>
      <option value="learner">Learner view</option>
    </select>
  );
}
