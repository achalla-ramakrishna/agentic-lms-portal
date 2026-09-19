import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { masteryBullets, toolkitTags } from "@/lib/content";

export default async function CompetencyPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const competency = await prisma.competency.findUnique({
    where: { number: Number(number) },
    include: { exercises: { orderBy: { number: "asc" } } }, // fixed 01→04
  });

  if (!competency) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/competencies" className="text-sm font-medium">
        ← All competencies
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {String(competency.number).padStart(2, "0")} · {competency.title}
      </h1>
      <p className="mt-1 text-neutral-500">{competency.subtitle}</p>

      <section className="mt-8 space-y-6 rounded-xl border border-neutral-200 bg-white p-7">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-orange-700">
            The Shift
          </h2>
          <p className="mt-2 leading-relaxed text-neutral-700">
            {competency.shiftMarkdown}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 border-t border-neutral-200 pt-5 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-emerald-800">
              ✓ What mastery looks like
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-neutral-700">
              {masteryBullets(competency).map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">
              ⚠ Common mistake to avoid
            </h3>
            <p className="mt-2 text-sm text-neutral-700">
              {competency.commonMistakeMarkdown}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-neutral-200 pt-5">
          {toolkitTags(competency).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Exercises in this competency
        </h2>
        <ol className="flex flex-col gap-2">
          {competency.exercises.map((ex) => (
            <li key={ex.id}>
              <Link
                href={`/competencies/${competency.number}/exercises/${ex.number}`}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-5 py-3 hover:border-neutral-400"
              >
                <span className="flex items-center gap-4">
                  <span className="font-mono text-sm text-orange-700">
                    {String(ex.number).padStart(2, "0")}
                  </span>
                  <span className="font-medium">{ex.title}</span>
                </span>
                <span className="text-sm text-neutral-500">
                  {ex.durationLabel}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
