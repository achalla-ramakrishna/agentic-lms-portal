"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/app/status-badge";
import { ToolkitHub } from "./ToolkitHub";
import { HowToFlow } from "./HowToFlow";
import { ActivityFlow } from "./ActivityFlow";
import { AgentCoreDiagram } from "./AgentCoreDiagram";
import { competencyStyle } from "@/lib/competency-style";
import type { ToolkitDoc } from "@/lib/toolkit-doc-links";
import type { SubmissionStatus } from "@prisma/client";

type ExerciseTabData = {
  id: number;
  number: number;
  title: string;
  durationLabel: string;
  howToSteps: string[];
  status: SubmissionStatus;
  missionMarkdown: string;
  projectNames: string[];
  evidenceCount: number;
};

type Props = {
  competencyNumber: number;
  competencyTitle: string;
  tagline: string;
  shiftMarkdown: string;
  masteryBullets: string[];
  commonMistakeMarkdown: string;
  toolkitTags: string[];
  inPracticeBullets: string[];
  toolkitDocs: ToolkitDoc[];
  inputArtifacts: string[];
  outputArtifacts: string[];
  outputArtifactsTruncatedCount: number;
  exercises: ExerciseTabData[];
};

const TABS = ["Learn", "How To", "Exercises"] as const;
type Tab = (typeof TABS)[number];

export function CompetencyTabs({
  competencyNumber,
  competencyTitle,
  tagline,
  shiftMarkdown,
  masteryBullets,
  commonMistakeMarkdown,
  toolkitTags,
  inPracticeBullets,
  toolkitDocs,
  inputArtifacts,
  outputArtifacts,
  outputArtifactsTruncatedCount,
  exercises,
}: Props) {
  const [tab, setTab] = useState<Tab>("Learn");
  const [openExerciseId, setOpenExerciseId] = useState<number | null>(null);
  const color = competencyStyle(competencyNumber).border;

  return (
    <div>
      <div className="inline-flex rounded-full border border-line bg-canvas-inset p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-fg text-canvas"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Learn" && (
        <section className="mt-6 space-y-6 rounded-xl border border-line bg-canvas-subtle p-7">
          {tagline && (
            <p className="border-l-4 pl-4 text-base font-bold text-fg" style={{ borderColor: color }}>
              {tagline}
            </p>
          )}

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">
              The Shift
            </h2>
            <p className="mt-2 whitespace-pre-line text-justify leading-relaxed text-fg">
              {shiftMarkdown}
            </p>
          </div>

          {inPracticeBullets.length > 0 && (
            <div className="border-t border-line pt-5">
              <AgentCoreDiagram competencyNumber={competencyNumber} />
            </div>
          )}

          {inPracticeBullets.length > 0 && (
            <div className="border-t border-line pt-5">
              <h3 className="text-xl font-bold text-fg">In Practice</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-fg">
                {inPracticeBullets.map((b, i) => (
                  <li key={i}>
                    <BoldText text={b} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 border-t border-line pt-5 sm:grid-cols-2">
            <div className="rounded-xl border border-success-fg/40 bg-success-fg/10 p-4">
              <h3 className="text-sm font-semibold text-success-fg">
                ✓ What mastery looks like
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-fg">
                {masteryBullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-attention-fg/40 bg-attention-fg/10 p-4">
              <h3 className="text-sm font-semibold text-attention-fg">
                ⚠ Common mistake to avoid
              </h3>
              <p className="mt-2 text-sm text-fg">{commonMistakeMarkdown}</p>
            </div>
          </div>

          <div className="border-t border-line pt-6">
            <h3 className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-fg-muted">
              How This Competency Flows
            </h3>
            <ActivityFlow
              competencyNumber={competencyNumber}
              title={competencyTitle}
              inputs={inputArtifacts}
              outputs={outputArtifacts}
              outputsTruncatedCount={outputArtifactsTruncatedCount}
              docs={toolkitDocs}
            />
          </div>

          <div className="border-t border-line pt-6">
            <h3 className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-fg-muted">
              Toolkit
            </h3>
            <ToolkitHub
              competencyNumber={competencyNumber}
              tags={toolkitTags}
              docs={toolkitDocs}
            />
          </div>
        </section>
      )}

      {tab === "How To" && (
        <section className="mt-6 flex flex-col gap-4">
          <p className="text-sm text-fg-muted">
            Each exercise&apos;s own steps, collected here so you can see the
            competency&apos;s whole method at a glance before picking one.
            Click the <span aria-hidden="true">ⓘ</span> for its mission, real
            project, and evidence count.
          </p>
          {exercises.map((ex) => {
            const isOpen = openExerciseId === ex.id;
            return (
              <div
                key={ex.id}
                className="rounded-xl border border-line bg-canvas-subtle p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <Link
                    href={`/competencies/${competencyNumber}/exercises/${ex.number}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {String(ex.number).padStart(2, "0")} {ex.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpenExerciseId(isOpen ? null : ex.id)}
                    title="Preview this exercise"
                    className={`rounded-full px-1.5 text-base ${
                      isOpen ? "text-accent" : "text-fg-subtle hover:text-fg"
                    }`}
                  >
                    <span aria-hidden="true">ⓘ</span>
                  </button>
                </div>
                {isOpen && (
                  <div
                    className="mt-3 rounded-lg border-t px-4 py-3 text-sm"
                    style={{ borderColor: color }}
                  >
                    <p className="whitespace-pre-line leading-relaxed text-fg">
                      {ex.missionMarkdown}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-fg-muted">
                      {ex.projectNames.length > 0 && (
                        <span>
                          📁 Real project:{" "}
                          <code className="font-mono text-fg">
                            {ex.projectNames.join(", ")}
                          </code>
                        </span>
                      )}
                      <span>
                        ☑ {ex.evidenceCount} evidence item
                        {ex.evidenceCount === 1 ? "" : "s"} required
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <HowToFlow steps={ex.howToSteps} color={color} />
                </div>
              </div>
            );
          })}
        </section>
      )}

      {tab === "Exercises" && (
        <section className="mt-6">
          <p className="mb-3 text-sm text-fg-muted">
            Click the <span aria-hidden="true">ⓘ</span> to preview an
            exercise&apos;s mission, real project, and evidence count before
            opening it.
          </p>
          <ol className="flex flex-col gap-2">
            {exercises.map((ex) => {
              const isOpen = openExerciseId === ex.id;
              return (
                <li
                  key={ex.id}
                  className="overflow-hidden rounded-lg border border-line bg-canvas-subtle"
                >
                  <div className="flex items-center justify-between gap-3 px-5 py-3">
                    <Link
                      href={`/competencies/${competencyNumber}/exercises/${ex.number}`}
                      className="flex min-w-0 flex-1 items-center gap-4 hover:opacity-90"
                    >
                      <span className="font-mono text-sm text-accent">
                        {String(ex.number).padStart(2, "0")}
                      </span>
                      <span className="truncate font-medium text-fg">
                        {ex.title}
                      </span>
                    </Link>
                    <span className="flex shrink-0 items-center gap-3 text-sm text-fg-muted">
                      {ex.durationLabel}
                      <StatusBadge status={ex.status} />
                      <button
                        type="button"
                        onClick={() => setOpenExerciseId(isOpen ? null : ex.id)}
                        title="Preview this exercise"
                        className={`rounded-full px-1.5 text-base ${
                          isOpen ? "text-accent" : "text-fg-subtle hover:text-fg"
                        }`}
                      >
                        <span aria-hidden="true">ⓘ</span>
                      </button>
                    </span>
                  </div>
                  {isOpen && (
                    <div
                      className="border-t border-line px-5 py-4 text-sm"
                      style={{ borderColor: color }}
                    >
                      <p className="whitespace-pre-line leading-relaxed text-fg">
                        {ex.missionMarkdown}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-fg-muted">
                        {ex.projectNames.length > 0 && (
                          <span>
                            📁 Real project:{" "}
                            <code className="font-mono text-fg">
                              {ex.projectNames.join(", ")}
                            </code>
                          </span>
                        )}
                        <span>
                          ☑ {ex.evidenceCount} evidence item
                          {ex.evidenceCount === 1 ? "" : "s"} required
                        </span>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </div>
  );
}

// Renders **bold** markers within an otherwise-plain bullet — a couple of
// the real "In Practice" bullets bold specific terms in the booklet
// (e.g. "safe auto mode, not YOLO") — not full markdown, just this one
// marker, since that's all the source content actually uses here.
function BoldText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
