import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSubmission } from "@/lib/submissions";
import { startExercise } from "@/app/actions";
import { StatusBadge } from "@/app/status-badge";
import {
  completionCriteria,
  evidenceChecklist,
  howToSteps,
} from "@/lib/content";
import { competencyStyle } from "@/lib/competency-style";
import { competencyArtifacts } from "@/lib/competency-artifacts";
import { ActivityFlow } from "../../ActivityFlow";
import { HowToFlow } from "../../HowToFlow";
import { GuidanceDocs } from "../../GuidanceDocs";

export const dynamic = "force-dynamic";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ number: string; exerciseNumber: string }>;
}) {
  const { number, exerciseNumber } = await params;
  const competency = await prisma.competency.findUnique({
    where: { number: Number(number) },
  });
  if (!competency) notFound();

  const exercise = await prisma.exercise.findUnique({
    where: {
      competencyId_number: {
        competencyId: competency.id,
        number: Number(exerciseNumber),
      },
    },
    include: {
      projects: true,
      guidanceDocs: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!exercise) notFound();

  const artifacts = competencyArtifacts([exercise]);
  const color = competencyStyle(competency.number).border;

  const session = await getServerSession(authOptions);
  const submission = await getSubmission(Number(session!.user.id), exercise.id);
  const status = submission?.status ?? "not_started";
  const pagePath = `/competencies/${competency.number}/exercises/${exercise.number}`;
  const startExerciseWithArgs = startExercise.bind(
    null,
    exercise.id,
    pagePath,
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href={`/competencies/${competency.number}`}
        className="text-sm font-medium text-accent hover:underline"
      >
        ← {String(competency.number).padStart(2, "0")} {competency.title}
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-fg">
          Exercise {String(exercise.number).padStart(2, "0")} ·{" "}
          {exercise.title}
        </h1>
        <span className="shrink-0 text-sm text-fg-muted">
          ⏱ {exercise.durationLabel}
        </span>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Your Mission
        </h2>
        <p className="mt-2 whitespace-pre-line leading-relaxed text-fg">
          {exercise.missionMarkdown}
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
        <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-fg-muted">
          How This Exercise Flows
        </h2>
        <ActivityFlow
          competencyNumber={competency.number}
          title={exercise.title}
          inputs={artifacts.inputs}
          outputs={artifacts.outputs}
          outputsTruncatedCount={artifacts.outputsTruncatedCount}
          docs={exercise.guidanceDocs}
        />
      </section>

      <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Project
        </h2>
        <ul className="mt-2 space-y-1">
          {exercise.projects.map((p) => (
            <li key={p.id} className="text-sm text-fg">
              📁 <code className="font-mono">{p.displayName}</code>
              <span className="ml-2 text-fg-subtle">{p.repoPath}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-fg-subtle">
          This is a path in your own clone of the exercise-set repo, not a
          link — the portal doesn&apos;t host or open the project (see
          &ldquo;How To Go About It&rdquo; above).
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          How To Go About It
        </h2>
        <div className="mt-4">
          <HowToFlow steps={howToSteps(exercise)} color={color} />
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section className="rounded-xl border border-line bg-canvas-subtle p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Evidence Checklist
          </h2>
          {evidenceChecklist(exercise).length === 0 ? (
            <p className="mt-2 text-sm text-fg-subtle">
              No evidence items listed for this exercise.
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm text-fg">
              {evidenceChecklist(exercise).map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span>☐</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-xl border border-line bg-canvas-subtle p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Completion Criteria
          </h2>
          {completionCriteria(exercise).length === 0 ? (
            <p className="mt-2 text-sm text-fg-subtle">
              No completion criteria listed for this exercise.
            </p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm text-fg">
              {completionCriteria(exercise).map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span>☐</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {exercise.guidanceDocs.length > 0 && (
        <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Templates &amp; Guidelines
          </h2>
          <p className="mt-1 text-xs text-fg-subtle">
            Real reference docs from this exercise&apos;s own repo folder —
            not generic advice. Copy a template and fill it in, or use a
            contract doc to check your output&apos;s structure before you
            submit.
          </p>
          <div className="mt-4">
            <GuidanceDocs docs={exercise.guidanceDocs} />
          </div>
        </section>
      )}

      <section className="mt-6 flex items-center justify-between rounded-xl border border-line bg-canvas-subtle p-7">
        <StatusBadge status={status} />

        {status === "not_started" && (
          <form action={startExerciseWithArgs}>
            <button
              type="submit"
              className="rounded-md bg-success-emphasis px-4 py-2 text-sm font-medium text-white hover:bg-success-emphasis-hover"
            >
              Start Exercise
            </button>
          </form>
        )}

        {(status === "in_progress" || status === "needs_rework") && (
          <Link
            href={`/submissions/new?exercise=${exercise.id}`}
            className="rounded-md bg-success-emphasis px-4 py-2 text-sm font-medium text-white hover:bg-success-emphasis-hover"
          >
            {status === "needs_rework" ? "Resubmit Evidence" : "Submit Evidence"}
          </Link>
        )}

        {(status === "submitted" || status === "passed") && submission && (
          <Link
            href={`/submissions/${submission.id}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            View submission →
          </Link>
        )}
      </section>

      {status === "needs_rework" && submission?.facilitatorComment && (
        <section className="mt-4 rounded-xl border border-attention-fg/40 bg-attention-subtle p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-attention-fg">
            Facilitator feedback
          </p>
          <p className="mt-1 text-sm text-fg">
            {submission.facilitatorComment}
          </p>
        </section>
      )}
    </main>
  );
}
