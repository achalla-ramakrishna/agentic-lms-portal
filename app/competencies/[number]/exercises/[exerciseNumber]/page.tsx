import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  completionCriteria,
  evidenceChecklist,
  howToSteps,
} from "@/lib/content";

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
    include: { projects: true },
  });
  if (!exercise) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href={`/competencies/${competency.number}`}
        className="text-sm font-medium"
      >
        ← {String(competency.number).padStart(2, "0")} {competency.title}
      </Link>

      <div className="mt-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          Exercise {String(exercise.number).padStart(2, "0")} ·{" "}
          {exercise.title}
        </h1>
        <span className="text-sm text-neutral-500">
          ⏱ {exercise.durationLabel}
        </span>
      </div>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Your Mission
        </h2>
        <p className="mt-2 whitespace-pre-line leading-relaxed text-neutral-700">
          {exercise.missionMarkdown}
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Project
        </h2>
        <ul className="mt-2 space-y-1">
          {exercise.projects.map((p) => (
            <li key={p.id} className="text-sm text-neutral-700">
              📁 <code className="font-mono">{p.displayName}</code>
              <span className="ml-2 text-neutral-400">{p.repoPath}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          How To Go About It
        </h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-neutral-700">
          {howToSteps(exercise).map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 bg-white p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Evidence Checklist
          </h2>
          <ul className="mt-2 space-y-2 text-sm text-neutral-700">
            {evidenceChecklist(exercise).map((item, i) => (
              <li key={i} className="flex gap-2">
                <span>☐</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-neutral-200 bg-white p-7">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Completion Criteria
          </h2>
          <ul className="mt-2 space-y-2 text-sm text-neutral-700">
            {completionCriteria(exercise).map((item, i) => (
              <li key={i} className="flex gap-2">
                <span>☐</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-6 text-sm text-neutral-400">
        Start/Submit is wired up once auth lands (docs/SPEC.md §7, chunk 3–4).
      </p>
    </main>
  );
}
