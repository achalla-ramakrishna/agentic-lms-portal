"use client";

import { useState } from "react";
import { COMPETENCY_ICON, competencyStyle } from "@/lib/competency-style";
import { ARTIFACT_ICON, artifactCategory } from "@/lib/artifact-icons";
import { resolveArtifactTag } from "@/lib/artifact-lookup";
import type { ToolkitDoc } from "@/lib/toolkit-doc-links";
import { GuidanceDocs } from "./GuidanceDocs";

// RUP-style "input artifacts -> activity -> output artifacts" diagram,
// built entirely from real data: inputs are the actual starter-app
// projects a learner begins from, outputs are the actual backtick-named
// evidence files each exercise's README asks for (lib/competency-
// artifacts.ts — nothing here is invented copy).
//
// When `docs` is passed, each artifact chip becomes clickable using the
// same three-tier resolver as ToolkitHub's toolkit tags (real file >
// reference template > glossary) — an output like `spec.md` or
// `evidence/before.md` gets exactly the same click-to-learn treatment a
// toolkit tag does. A chip with nothing real to show (most exercise-
// specific outputs, and every input — a project folder name has no
// glossary entry) stays a plain, non-interactive label rather than
// faking a click target.
export function ActivityFlow({
  competencyNumber,
  title,
  inputs,
  outputs,
  outputsTruncatedCount,
  docs = [],
}: {
  competencyNumber: number;
  title: string;
  inputs: string[];
  outputs: string[];
  outputsTruncatedCount: number;
  docs?: ToolkitDoc[];
}) {
  const palette = competencyStyle(competencyNumber);
  const [openArtifact, setOpenArtifact] = useState<string | null>(null);
  const resolution = openArtifact ? resolveArtifactTag(openArtifact, docs) : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-stretch md:gap-0">
        <ArtifactColumn
          label="Input artifacts"
          items={inputs}
          icon="📁"
          docs={docs}
          openArtifact={openArtifact}
          onToggle={setOpenArtifact}
        />

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
          docs={docs}
          openArtifact={openArtifact}
          onToggle={setOpenArtifact}
        />
      </div>

      {openArtifact && resolution && resolution.clickable && (
        <div className="rounded-2xl border-2 p-4" style={{ borderColor: palette.border }}>
          {resolution.matches.length > 0 && (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h4
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: palette.text }}
                >
                  Real {openArtifact} example
                  {resolution.matches.length > 1 ? "s" : ""} from this
                  competency&apos;s exercises
                </h4>
                <button
                  type="button"
                  onClick={() => setOpenArtifact(null)}
                  className="shrink-0 text-xs text-fg-subtle hover:text-fg"
                >
                  ✕ Close
                </button>
              </div>
              <GuidanceDocs docs={resolution.matches} />
            </>
          )}

          {resolution.matches.length === 0 && resolution.template && (
            <>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h4
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: palette.text }}
                >
                  Reference Template: {openArtifact}
                </h4>
                <button
                  type="button"
                  onClick={() => setOpenArtifact(null)}
                  className="shrink-0 text-xs text-fg-subtle hover:text-fg"
                >
                  ✕ Close
                </button>
              </div>
              <p className="mb-3 text-sm leading-relaxed text-fg-muted">
                {resolution.template.intro}
              </p>
              <p className="mb-3 text-xs text-fg-subtle">
                A reusable template you can adapt to your own project — not
                a file from your specific exercise repo.
              </p>
              <GuidanceDocs docs={resolution.template.docs} />
            </>
          )}

          {resolution.matches.length === 0 &&
            !resolution.template &&
            resolution.glossary && (
              <>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                    What is {openArtifact}?
                  </h4>
                  <button
                    type="button"
                    onClick={() => setOpenArtifact(null)}
                    className="shrink-0 text-xs text-fg-subtle hover:text-fg"
                  >
                    ✕ Close
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-fg">
                  {resolution.glossary}
                </p>
              </>
            )}
        </div>
      )}
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
  docs,
  openArtifact,
  onToggle,
}: {
  label: string;
  items: string[];
  icon?: string;
  iconFor?: (item: string) => string;
  truncatedCount?: number;
  docs: ToolkitDoc[];
  openArtifact: string | null;
  onToggle: (item: string | null) => void;
}) {
  if (items.length === 0) return <div className="w-full md:w-48" />;

  return (
    <div className="flex w-full flex-col gap-1.5 md:w-48">
      <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-fg-muted md:text-left">
        {label}
      </p>
      {items.map((item) => {
        const { clickable } = resolveArtifactTag(item, docs);
        const isOpen = openArtifact === item;
        return (
          <button
            key={item}
            type="button"
            disabled={!clickable}
            onClick={() => onToggle(isOpen ? null : item)}
            title={clickable ? `Learn about ${item}` : undefined}
            className={`flex items-center gap-2 rounded-md border bg-canvas-subtle px-3 py-1.5 text-xs text-fg transition-shadow ${
              isOpen ? "border-accent shadow-sm" : "border-line"
            } ${clickable ? "cursor-pointer hover:shadow-sm" : "cursor-default"}`}
          >
            <span aria-hidden="true">{iconFor ? iconFor(item) : icon}</span>
            <code className="truncate font-mono" title={item}>
              {item}
            </code>
            {clickable && (
              <span className="ml-auto shrink-0 text-fg-subtle" aria-hidden="true">
                ⓘ
              </span>
            )}
          </button>
        );
      })}
      {truncatedCount > 0 && (
        <p className="text-center text-[10px] text-fg-subtle md:text-left">
          +{truncatedCount} more
        </p>
      )}
    </div>
  );
}
