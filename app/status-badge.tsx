import type { Submission } from "@prisma/client";
import { STATUS_LABEL, STATUS_BADGE_CLASS } from "@/lib/submissions";

export function StatusBadge({ status }: { status: Submission["status"] }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
