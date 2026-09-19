import Link from "next/link";
import { notFound, forbidden } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STATUS_LABEL } from "@/lib/submissions";

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
    </main>
  );
}
