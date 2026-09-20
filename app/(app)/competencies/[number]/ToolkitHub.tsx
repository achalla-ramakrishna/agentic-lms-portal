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
import { artifactGlossaryEntry } from "@/lib/artifact-glossary";
import { GuidanceDocs } from "./GuidanceDocs";

// Swimlane rendering of a competency's toolkitTags: each lane is a real
// artifact category (lib/artifact-icons.ts' classifier, already checked
// against every tag in content/seed.json), not an invented process phase
// like the RUP reference's "Analysis"/"Design" — grouping by the type of
// thing the tag actually is (a guardrail, a test tool, a doc, ...).
//
// Every tag is clickable, but what it opens is honest about its source:
// - A tag with a real ingested file (docs/*.md, or a real SKILL.md found
//   anywhere in the exercise tree — scripts/generate-seed.mjs) opens that
//   actual file, styled in accent color with "↗" — a genuine example.
// - Every other tag opens a short, general "what is this" explanation
//   (lib/artifact-glossary.ts — real, established terminology, not
//   invented for this exercise) styled plainly with "ⓘ" — never dressed
//   up to look like it came from the learner's own repo.
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
  const openMatches = openTag ? matchToolkitTagDocs(openTag, docs) : [];
  const openGlossary = openTag && openMatches.length === 0 ? artifactGlossaryEntry(openTag) : undefined;

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
              const glossary = artifactGlossaryEntry(tag);
              const clickable = hasMatch || !!glossary;
              const isOpen = openTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  disabled={!clickable}
                  onClick={() => setOpenTag(isOpen ? null : tag)}
                  title={
                    hasMatch
                      ? `See ${matches.length} real ${tag} example${matches.length > 1 ? "s" : ""} from this competency's exercises`
                      : glossary
                        ? `What is ${tag}?`
                        : undefined
                  }
                  className={`flex w-20 flex-col items-center gap-1.5 rounded-xl ${
                    clickable ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 bg-canvas-subtle text-2xl shadow-sm transition-shadow ${
                      clickable ? "hover:shadow-md" : ""
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
                    {!hasMatch && glossary && <span aria-hidden="true"> ⓘ</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {openTag && openMatches.length > 0 && (
        <div className="rounded-2xl border-2 p-4" style={{ borderColor: palette.border }}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: palette.text }}
            >
              Real {openTag} example{openMatches.length > 1 ? "s" : ""} from
              this competency&apos;s exercises
            </h4>
            <button
              type="button"
              onClick={() => setOpenTag(null)}
              className="shrink-0 text-xs text-fg-subtle hover:text-fg"
            >
              ✕ Close
            </button>
          </div>
          <GuidanceDocs docs={openMatches} />
        </div>
      )}

      {openTag && openGlossary && (
        <div className="rounded-2xl border-2 border-line bg-canvas-subtle p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
              What is {openTag}?
            </h4>
            <button
              type="button"
              onClick={() => setOpenTag(null)}
              className="shrink-0 text-xs text-fg-subtle hover:text-fg"
            >
              ✕ Close
            </button>
          </div>
          <p className="text-sm leading-relaxed text-fg">{openGlossary}</p>
        </div>
      )}
    </div>
  );
}
