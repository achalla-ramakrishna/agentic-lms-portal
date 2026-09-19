import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSubmission } from "@/lib/submissions";
import { evidenceChecklist } from "@/lib/content";
import { saveSubmission } from "@/app/actions";
import { competencyArtifacts } from "@/lib/competency-artifacts";
import { ActivityFlow } from "../../competencies/[number]/ActivityFlow";
import { GuidanceDocs } from "../../competencies/[number]/GuidanceDocs";

export const dynamic = "force-dynamic";

export default async function NewSubmissionPage({
  searchParams,
}: {
  searchParams: Promise<{ exercise?: string }>;
}) {
  const { exercise: exerciseIdParam } = await searchParams;
  const exerciseId = Number(exerciseIdParam);
  if (!exerciseId) notFound();

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: {
      competency: true,
      projects: true,
      guidanceDocs: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!exercise) notFound();

  const artifacts = competencyArtifacts([exercise]);

  const session = await getServerSession(authOptions);
  const existing = await getSubmission(Number(session!.user.id), exercise.id);
  const existingArtifacts = existing
    ? await prisma.evidenceArtifact.findMany({
        where: { submissionId: existing.id },
      })
    : [];
  const urlByLabel = new Map(
    existingArtifacts.map((a) => [a.checklistLabel, a.url]),
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-xl font-semibold tracking-tight text-fg">
        Submit: {String(exercise.number).padStart(2, "0")} ·{" "}
        {exercise.title}
      </h1>

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

      {exercise.guidanceDocs.length > 0 && (
        <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Templates &amp; Guidelines
          </h2>
          <p className="mt-1 text-xs text-fg-subtle">
            Real templates for this exercise&apos;s evidence — copy one and
            fill it in before pasting links below.
          </p>
          <div className="mt-4">
            <GuidanceDocs docs={exercise.guidanceDocs} />
          </div>
        </section>
      )}

      <form
        action={saveSubmission}
        className="mt-6 flex flex-col gap-6 rounded-xl border border-line bg-canvas-subtle p-7"
      >
        <input type="hidden" name="exerciseId" value={exercise.id} />

        <div className="flex flex-col gap-1">
          <label htmlFor="prLink" className="text-sm font-medium text-fg">
            Link to your branch / PR
          </label>
          <input
            id="prLink"
            name="prLink"
            type="url"
            placeholder="https://github.com/you/exercises/pull/14"
            defaultValue={existing?.prLink ?? ""}
            className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-fg">
            Attach evidence (matches this exercise&apos;s checklist)
          </p>
          <p className="mt-1 text-xs text-fg-muted">
            Paste a link per item — nothing is required, but an unfilled
            item stays uncovered in the facilitator&apos;s review.
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {evidenceChecklist(exercise).length === 0 && (
              <p className="text-sm text-fg-subtle">
                No evidence items listed for this exercise — a PR link and
                notes below are enough.
              </p>
            )}
            {evidenceChecklist(exercise).map((item, i) => (
              <div key={i} className="flex flex-col gap-1">
                <label
                  htmlFor={`evidence-${i}`}
                  className="text-xs text-fg-muted"
                >
                  {item.label}
                </label>
                <input
                  id={`evidence-${i}`}
                  name={`evidence:${item.label}`}
                  type="text"
                  placeholder="link or note"
                  defaultValue={urlByLabel.get(item.label) ?? ""}
                  className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="learnerNote" className="text-sm font-medium text-fg">
            Notes for the reviewer (optional)
          </label>
          <textarea
            id="learnerNote"
            name="learnerNote"
            rows={3}
            defaultValue={existing?.learnerNote ?? ""}
            className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            name="intent"
            value="draft"
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-fg hover:bg-white/5"
          >
            Save Draft
          </button>
          <button
            type="submit"
            name="intent"
            value="submit"
            className="rounded-md bg-success-emphasis px-4 py-2 text-sm font-medium text-white hover:bg-success-emphasis-hover"
          >
            Submit
          </button>
        </div>
      </form>
    </main>
  );
}
