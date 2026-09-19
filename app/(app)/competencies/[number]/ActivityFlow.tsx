import { COMPETENCY_ICON, competencyStyle } from "@/lib/competency-style";
import { ARTIFACT_ICON, artifactCategory } from "@/lib/artifact-icons";

// RUP-style "input artifacts -> activity -> output artifacts" diagram,
// built entirely from real data: inputs are the actual starter-app
// projects a learner begins from, outputs are the actual backtick-named
// evidence files each exercise's README asks for (lib/competency-
// artifacts.ts — nothing here is invented copy).
export function ActivityFlow({
  competencyNumber,
  title,
  inputs,
  outputs,
  outputsTruncatedCount,
}: {
  competencyNumber: number;
  title: string;
  inputs: string[];
  outputs: string[];
  outputsTruncatedCount: number;
}) {
  const palette = competencyStyle(competencyNumber);

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-stretch md:gap-0">
      <ArtifactColumn label="Input artifacts" items={inputs} icon="📁" />

      <Connector />

      <div className="flex shrink-0 items-center justify-center py-2 md:px-2">
        <div
          className="relative flex min-w-[180px] items-center gap-3 px-6 py-5 text-white shadow-lg"
          style={{
            backgroundColor: palette.border,
            clipPath:
              "polygon(0% 0%, 82% 0%, 100% 50%, 82% 100%, 0% 100%)",
          }}
        >
          <span className="text-2xl" aria-hidden="true">
            {COMPETENCY_ICON[competencyNumber]}
          </span>
          <span className="pr-4 text-sm font-bold leading-tight">
            {title}
          </span>
        </div>
      </div>

      <Connector />

      <ArtifactColumn
        label="Output artifacts"
        items={outputs}
        truncatedCount={outputsTruncatedCount}
        iconFor={(item) => ARTIFACT_ICON[artifactCategory(item)]}
      />
    </div>
  );
}

function Connector() {
  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center text-fg-subtle md:h-auto md:w-8"
      aria-hidden="true"
    >
      <span className="text-lg md:hidden">↓</span>
      <span className="hidden text-lg md:inline">→</span>
    </div>
  );
}

function ArtifactColumn({
  label,
  items,
  icon,
  iconFor,
  truncatedCount = 0,
}: {
  label: string;
  items: string[];
  icon?: string;
  iconFor?: (item: string) => string;
  truncatedCount?: number;
}) {
  if (items.length === 0) return <div className="w-full md:w-48" />;

  return (
    <div className="flex w-full flex-col gap-1.5 md:w-48">
      <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-fg-muted md:text-left">
        {label}
      </p>
      {items.map((item) => (
        <div
          key={item}
          className="flex items-center gap-2 rounded-md border border-line bg-canvas-subtle px-3 py-1.5 text-xs text-fg"
        >
          <span aria-hidden="true">{iconFor ? iconFor(item) : icon}</span>
          <code className="truncate font-mono" title={item}>
            {item}
          </code>
        </div>
      ))}
      {truncatedCount > 0 && (
        <p className="text-center text-[10px] text-fg-subtle md:text-left">
          +{truncatedCount} more
        </p>
      )}
    </div>
  );
}
