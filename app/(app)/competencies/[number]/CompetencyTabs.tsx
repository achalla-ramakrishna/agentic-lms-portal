"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/app/status-badge";
import { ToolkitHub } from "./ToolkitHub";
import { HowToFlow } from "./HowToFlow";
import { ActivityFlow } from "./ActivityFlow";
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
};

type Props = {
  competencyNumber: number;
  competencyTitle: string;
  shiftMarkdown: string;
  masteryBullets: string[];
  commonMistakeMarkdown: string;
  toolkitTags: string[];
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
  shiftMarkdown,
  masteryBullets,
  commonMistakeMarkdown,
  toolkitTags,
  toolkitDocs,
  inputArtifacts,
  outputArtifacts,
  outputArtifactsTruncatedCount,
  exercises,
}: Props) {
  const [tab, setTab] = useState<Tab>("Learn");
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
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-accent">
              The Shift
            </h2>
            <p className="mt-2 leading-relaxed text-fg">{shiftMarkdown}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t border-line pt-5 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-success-fg">
                ✓ What mastery looks like
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-fg">
                {masteryBullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
            <div>
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
          </p>
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="rounded-xl border border-line bg-canvas-subtle p-6"
            >
              <Link
                href={`/competencies/${competencyNumber}/exercises/${ex.number}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                {String(ex.number).padStart(2, "0")} {ex.title}
              </Link>
              <div className="mt-4">
                <HowToFlow steps={ex.howToSteps} color={color} />
              </div>
            </div>
          ))}
        </section>
      )}

      {tab === "Exercises" && (
        <section className="mt-6">
          <ol className="flex flex-col gap-2">
            {exercises.map((ex) => (
              <li key={ex.id}>
                <Link
                  href={`/competencies/${competencyNumber}/exercises/${ex.number}`}
                  className="flex items-center justify-between rounded-lg border border-line bg-canvas-subtle px-5 py-3 hover:border-fg-subtle"
                >
                  <span className="flex items-center gap-4">
                    <span className="font-mono text-sm text-accent">
                      {String(ex.number).padStart(2, "0")}
                    </span>
                    <span className="font-medium text-fg">{ex.title}</span>
                  </span>
                  <span className="flex items-center gap-3 text-sm text-fg-muted">
                    {ex.durationLabel}
                    <StatusBadge status={ex.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
