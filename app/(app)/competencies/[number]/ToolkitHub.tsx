import { COMPETENCY_ICON, competencyStyle } from "@/lib/competency-style";
import { ARTIFACT_ICON, artifactCategory } from "@/lib/artifact-icons";

// Hub-and-spoke rendering of a competency's toolkitTags, replacing a flat
// row of pills — same real data, arranged as a diagram instead of a list.
// SVG draws the spoke lines (cheap, scales cleanly); labels are plain
// positioned HTML rather than SVG <text> so variable-length tag names
// don't need manual wrapping/measurement logic.
export function ToolkitHub({
  competencyNumber,
  tags,
}: {
  competencyNumber: number;
  tags: string[];
}) {
  if (tags.length === 0) return null;

  const palette = competencyStyle(competencyNumber);
  const center = 200;
  const radius = 150;

  const points = tags.map((tag, i) => {
    const angle = (-90 + (360 / tags.length) * i) * (Math.PI / 180);
    return {
      tag,
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[480px]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        {points.map((p, i) => (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke={palette.border}
            strokeWidth={1.5}
            strokeOpacity={0.5}
          />
        ))}
      </svg>

      <div
        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-canvas text-2xl"
        style={{ borderColor: palette.border }}
        aria-hidden="true"
      >
        {COMPETENCY_ICON[competencyNumber]}
      </div>

      {points.map((p, i) => (
        <div
          key={i}
          className="absolute flex w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
          style={{
            left: `${(p.x / 400) * 100}%`,
            top: `${(p.y / 400) * 100}%`,
          }}
        >
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 bg-canvas-subtle text-3xl shadow-md"
            style={{ borderColor: palette.border }}
            aria-hidden="true"
          >
            {ARTIFACT_ICON[artifactCategory(p.tag)]}
          </span>
          <span className="text-center text-[11px] font-medium leading-tight text-fg">
            {p.tag}
          </span>
        </div>
      ))}
    </div>
  );
}
