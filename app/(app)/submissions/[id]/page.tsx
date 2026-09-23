import Link from "next/link";
import { notFound, forbidden } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/app/status-badge";
import { evidenceChecklist } from "@/lib/content";
import { decideSubmission } from "@/app/actions";
import { competencyArtifacts } from "@/lib/competency-artifacts";
import { ActivityFlow } from "../../competencies/[number]/ActivityFlow";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id: Number(id) },
    include: {
      exercise: {
        include: { competency: true, projects: true },
      },
      evidenceArtifacts: true,
    },
  });
  if (!submission) notFound();

  const artifacts = competencyArtifacts([submission.exercise]);

  const session = await getServerSession(authOptions);
  // Own-submission-only for this chunk — a facilitator's cross-learner
  // access is chunk 5 (docs/features/0004-learner-flow.md non-goals).
  // super_admin reviews here too, and across every company, not just
  // its own (docs/features/0018-role-separation.md) — decideSubmission
  // itself is where that company boundary is actually enforced/skipped.
  const isOwner = Number(session!.user.id) === submission.userId;
  const roles = session!.user.roles ?? [];
  const isReviewer = roles.includes("facilitator") || roles.includes("super_admin");
  if (!isOwner && !isReviewer) {
    forbidden();
  }

  const { exercise } = submission;
  const coveredLabels = new Set(
    submission.evidenceArtifacts.map((a) => a.checklistLabel),
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href={`/competencies/${exercise.competency.number}/exercises/${exercise.number}`}
        className="text-sm font-medium text-accent hover:underline"
      >
        ← {String(exercise.number).padStart(2, "0")} {exercise.title}
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h1 className="min-w-0 text-xl font-semibold tracking-tight text-fg">
          Submission · {exercise.title}
        </h1>
        <span className="shrink-0">
          <StatusBadge status={submission.status} />
        </span>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
        <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-fg-muted">
          What This Submission Proves
        </h2>
        <ActivityFlow
          competencyNumber={exercise.competency.number}
          title={exercise.title}
          inputs={artifacts.inputs}
          outputs={artifacts.outputs}
          outputsTruncatedCount={artifacts.outputsTruncatedCount}
        />
      </section>

      <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          PR / Branch link
        </h2>
        <p className="mt-2 text-sm">
          {submission.prLink ? (
            <a
              href={submission.prLink}
              className="text-accent underline"
              target="_blank"
              rel="noreferrer"
            >
              {submission.prLink}
            </a>
          ) : (
            <span className="text-fg-subtle">None provided</span>
          )}
        </p>
      </section>

      {isReviewer && (
        <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Evidence checklist (from the exercise)
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {evidenceChecklist(exercise).map((item, i) => (
              <li key={i} className="flex gap-2">
                <span>{coveredLabels.has(item.label) ? "☑" : "☐"}</span>
                <span
                  className={
                    coveredLabels.has(item.label)
                      ? "text-fg"
                      : "text-fg-subtle"
                  }
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Evidence
        </h2>
        {submission.evidenceArtifacts.length === 0 ? (
          <p className="mt-2 text-sm text-fg-subtle">
            No evidence attached yet.
          </p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {submission.evidenceArtifacts.map((a) => (
              <li key={a.id}>
                <span className="text-fg-muted">{a.checklistLabel}:</span>{" "}
                {a.url.startsWith("http") ? (
                  <a
                    href={a.url}
                    className="text-accent underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {a.url}
                  </a>
                ) : (
                  <span className="text-fg">{a.url}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {submission.learnerNote && (
        <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Note to reviewer
          </h2>
          <p className="mt-2 text-sm text-fg">
            {submission.learnerNote}
          </p>
        </section>
      )}

      {submission.facilitatorComment && (
        <section className="mt-6 rounded-xl border border-attention-fg/40 bg-attention-subtle p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-attention-fg">
            Facilitator comment
          </h2>
          <p className="mt-2 text-sm text-fg">
            {submission.facilitatorComment}
          </p>
        </section>
      )}

      {(submission.status === "in_progress" ||
        submission.status === "needs_rework") &&
        isOwner && (
          <Link
            href={`/submissions/new?exercise=${exercise.id}`}
            className="mt-6 inline-block rounded-md bg-success-emphasis px-4 py-2 text-sm font-medium text-white hover:bg-success-emphasis-hover"
          >
            Edit submission
          </Link>
        )}

      {isReviewer && submission.status === "submitted" && (
        <form
          action={decideSubmission}
          className="mt-6 flex flex-col gap-4 rounded-xl border border-line bg-canvas-subtle p-7"
        >
          <input type="hidden" name="submissionId" value={submission.id} />
          <p className="text-sm font-medium text-fg">Decision</p>
          <div className="flex gap-6 text-sm text-fg">
            <label className="flex items-center gap-2">
              <input type="radio" name="decision" value="passed" required />
              Passed
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="decision" value="needs_rework" />
              Needs Rework
            </label>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="facilitatorComment" className="text-sm font-medium text-fg">
              Comment (optional)
            </label>
            <textarea
              id="facilitatorComment"
              name="facilitatorComment"
              rows={3}
              className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="self-end rounded-md bg-success-emphasis px-4 py-2 text-sm font-medium text-white hover:bg-success-emphasis-hover"
          >
            Submit Decision
          </button>
        </form>
      )}
    </main>
  );
}
