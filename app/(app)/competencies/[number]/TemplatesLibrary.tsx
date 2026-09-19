import Link from "next/link";
import { GuidanceDocs } from "./GuidanceDocs";

type GuidanceDoc = {
  id: number;
  filename: string;
  title: string;
  content: string;
};

type ExerciseGroup = {
  exerciseNumber: number;
  exerciseTitle: string;
  docs: GuidanceDoc[];
};

// Competency-level view of the same real guidance docs shown on each
// exercise page (GuidanceDocs.tsx) — grouped by exercise rather than
// deduplicated, since each exercise's evidence-template.md etc. is
// genuinely different content, not a repeated shared artifact.
export function TemplatesLibrary({
  competencyNumber,
  groups,
}: {
  competencyNumber: number;
  groups: ExerciseGroup[];
}) {
  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <div key={g.exerciseNumber}>
          <Link
            href={`/competencies/${competencyNumber}/exercises/${g.exerciseNumber}`}
            className="text-xs font-semibold uppercase tracking-wide text-accent hover:underline"
          >
            {String(g.exerciseNumber).padStart(2, "0")} {g.exerciseTitle}
          </Link>
          <div className="mt-2">
            <GuidanceDocs docs={g.docs} defaultOpenFirst={false} />
          </div>
        </div>
      ))}
    </div>
  );
}
