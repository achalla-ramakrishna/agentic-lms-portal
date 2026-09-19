import Link from "next/link";
import { notFound, forbidden } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STATUS_LABEL } from "@/lib/submissions";
import { evidenceChecklist } from "@/lib/content";
import { decideSubmission } from "@/app/actions";

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
      exercise: { include: { competency: true } },
      evidenceArtifacts: true,
    },
  });
  if (!submission) notFound();

  const session = await getServerSession(authOptions);
  // Own-submission-only for this chunk — a facilitator's cross-learner
  // access is chunk 5 (docs/features/0004-learner-flow.md non-goals).
  const isOwner = Number(session!.user.id) === submission.userId;
  const isFacilitator = session!.user.role === "facilitator";
  if (!isOwner && !isFacilitator) {
    forbidden();
  }

  const { exercise } = submission;
  const coveredLabels = new Set(
    submission.evidenceArtifacts.map((a) => a.checklistLabel),
  );

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href={`/competencies/${exercise.competency.number}/exercises/${exercise.number}`}
        className="text-sm font-medium"
      >
        ← {String(exercise.number).padStart(2, "0")} {exercise.title}
      </Link>

      <div className="mt-4 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          Submission · {exercise.title}
        </h1>
        <span className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-medium">
          {STATUS_LABEL[submission.status]}
        </span>
      </div>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          PR / Branch link
        </h2>
        <p className="mt-2 text-sm">
          {submission.prLink ? (
            <a
              href={submission.prLink}
              className="text-orange-700 underline"
              target="_blank"
              rel="noreferrer"
            >
              {submission.prLink}
            </a>
          ) : (
            <span className="text-neutral-400">None provided</span>
          )}
        </p>
      </section>

      {isFacilitator && (
        <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Evidence checklist (from the exercise)
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {evidenceChecklist(exercise).map((item, i) => (
              <li key={i} className="flex gap-2">
                <span>{coveredLabels.has(item.label) ? "☑" : "☐"}</span>
                <span
                  className={
                    coveredLabels.has(item.label)
                      ? "text-neutral-700"
                      : "text-neutral-400"
                  }
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Evidence
        </h2>
        {submission.evidenceArtifacts.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">
            No evidence attached yet.
          </p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {submission.evidenceArtifacts.map((a) => (
              <li key={a.id}>
                <span className="text-neutral-500">{a.checklistLabel}:</span>{" "}
                {a.url.startsWith("http") ? (
                  <a
                    href={a.url}
                    className="text-orange-700 underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {a.url}
                  </a>
                ) : (
                  a.url
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {submission.learnerNote && (
        <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Note to reviewer
          </h2>
          <p className="mt-2 text-sm text-neutral-700">
            {submission.learnerNote}
          </p>
        </section>
      )}

      {submission.facilitatorComment && (
        <section className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Facilitator comment
          </h2>
          <p className="mt-2 text-sm text-amber-900">
            {submission.facilitatorComment}
          </p>
        </section>
      )}

      {(submission.status === "in_progress" ||
        submission.status === "needs_rework") &&
        isOwner && (
          <Link
            href={`/submissions/new?exercise=${exercise.id}`}
            className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Edit submission
          </Link>
        )}

      {isFacilitator && submission.status === "submitted" && (
        <form
          action={decideSubmission}
          className="mt-6 flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-7"
        >
          <input type="hidden" name="submissionId" value={submission.id} />
          <p className="text-sm font-medium">Decision</p>
          <div className="flex gap-6 text-sm">
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
            <label htmlFor="facilitatorComment" className="text-sm font-medium">
              Comment (optional)
            </label>
            <textarea
              id="facilitatorComment"
              name="facilitatorComment"
              rows={3}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="self-end rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Submit Decision
          </button>
        </form>
      )}
    </main>
  );
}
