import { competencyStyle } from "@/lib/competency-style";
import {
  ARTIFACT_ICON,
  ARTIFACT_LANE_LABEL,
  artifactCategory,
  groupToolkitTags,
} from "@/lib/artifact-icons";

// Swimlane rendering of a competency's toolkitTags: each lane is a real
// artifact category (lib/artifact-icons.ts' classifier, already checked
// against every tag in content/seed.json), not an invented process phase
// like the RUP reference's "Analysis"/"Design" — grouping by the type of
// thing the tag actually is (a guardrail, a test tool, a doc, ...).
export function ToolkitHub({
  competencyNumber,
  tags,
}: {
  competencyNumber: number;
  tags: string[];
}) {
  if (tags.length === 0) return null;

  const palette = competencyStyle(competencyNumber);
  const lanes = groupToolkitTags(tags);

  return (
    <div className="flex flex-col gap-3">
      {lanes.map((lane) => (
        <div
          key={lane.category}
          className="flex flex-col gap-3 rounded-2xl border-2 p-4 sm:flex-row sm:items-center"
          style={{ borderColor: palette.border }}
        >
          <div className="shrink-0 sm:w-36 sm:border-r sm:pr-4" style={{ borderColor: palette.border }}>
            <span
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: palette.text }}
            >
              {ARTIFACT_LANE_LABEL[lane.category]}
            </span>
          </div>
          <div className="flex flex-1 flex-wrap gap-4">
            {lane.tags.map((tag) => (
              <div key={tag} className="flex w-20 flex-col items-center gap-1.5">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 bg-canvas-subtle text-2xl shadow-sm"
                  style={{ borderColor: palette.border }}
                  aria-hidden="true"
                >
                  {ARTIFACT_ICON[artifactCategory(tag)]}
                </span>
                <span className="text-center text-[10px] font-medium leading-tight text-fg">
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
