"use client";

import { useState } from "react";
import { competencyStyle } from "@/lib/competency-style";
import {
  ARTIFACT_ICON,
  ARTIFACT_LANE_LABEL,
  artifactCategory,
  groupToolkitTags,
} from "@/lib/artifact-icons";
import { matchToolkitTagDocs, type ToolkitDoc } from "@/lib/toolkit-doc-links";
import { GuidanceDocs } from "./GuidanceDocs";

// Swimlane rendering of a competency's toolkitTags: each lane is a real
// artifact category (lib/artifact-icons.ts' classifier, already checked
// against every tag in content/seed.json), not an invented process phase
// like the RUP reference's "Analysis"/"Design" — grouping by the type of
// thing the tag actually is (a guardrail, a test tool, a doc, ...).
//
// A tag is clickable only when a real ingested file (docs/*.md or a real
// SKILL.md found anywhere in the exercise tree — see
// scripts/generate-seed.mjs) matches its exact filename, so clicking never
// promises an example that doesn't exist. Most tags won't match anything
// in this dataset, and stay plain, non-interactive labels.
export function ToolkitHub({
  competencyNumber,
  tags,
  docs,
}: {
  competencyNumber: number;
  tags: string[];
  docs: ToolkitDoc[];
}) {
  const [openTag, setOpenTag] = useState<string | null>(null);

  if (tags.length === 0) return null;

  const palette = competencyStyle(competencyNumber);
  const lanes = groupToolkitTags(tags);
  const openDocs = openTag ? matchToolkitTagDocs(openTag, docs) : [];

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
            {lane.tags.map((tag) => {
              const matches = matchToolkitTagDocs(tag, docs);
              const hasMatch = matches.length > 0;
              const isOpen = openTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  disabled={!hasMatch}
                  onClick={() => setOpenTag(isOpen ? null : tag)}
                  title={
                    hasMatch
                      ? `See ${matches.length} real ${tag} example${matches.length > 1 ? "s" : ""} from this competency's exercises`
                      : undefined
                  }
                  className={`flex w-20 flex-col items-center gap-1.5 rounded-xl ${
                    hasMatch ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 bg-canvas-subtle text-2xl shadow-sm transition-shadow ${
                      hasMatch ? "hover:shadow-md" : ""
                    }`}
                    style={{
                      borderColor: palette.border,
                      boxShadow: isOpen ? `0 0 0 2px ${palette.border}` : undefined,
                    }}
                    aria-hidden="true"
                  >
                    {ARTIFACT_ICON[artifactCategory(tag)]}
                  </span>
                  <span
                    className={`text-center text-[10px] leading-tight ${
                      hasMatch ? "font-semibold text-accent" : "font-medium text-fg"
                    }`}
                  >
                    {tag}
                    {hasMatch && <span aria-hidden="true"> ↗</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {openTag && openDocs.length > 0 && (
        <div className="rounded-2xl border-2 p-4" style={{ borderColor: palette.border }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: palette.text }}
            >
              Real {openTag} example{openDocs.length > 1 ? "s" : ""} from this
              competency&apos;s exercises
            </h4>
            <button
              type="button"
              onClick={() => setOpenTag(null)}
              className="shrink-0 text-xs text-fg-subtle hover:text-fg"
            >
              ✕ Close
            </button>
          </div>
          <GuidanceDocs docs={openDocs} />
        </div>
      )}
    </div>
  );
}
