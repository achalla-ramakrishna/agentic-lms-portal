"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect, forbidden } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateSubmission } from "@/lib/submissions";
import { evidenceChecklist } from "@/lib/content";

async function requireUserId(): Promise<number> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  return Number(session.user.id);
}

async function requireFacilitatorId(): Promise<number> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  // Re-checked here, not just trusted from the page that rendered the
  // form — a server action is a public endpoint regardless of which page
  // links to it (docs/features/0005-facilitator-flow.md acceptance
  // criteria).
  if (session.user.role !== "facilitator") {
    forbidden();
  }
  return Number(session.user.id);
}

export async function startExercise(
  exerciseId: number,
  revalidateUrl: string,
) {
  const userId = await requireUserId();

  const submission = await getOrCreateSubmission(userId, exerciseId);
  if (submission.status === "not_started") {
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: "in_progress", startedAt: new Date() },
    });
  }

  revalidatePath(revalidateUrl);
}

export async function saveSubmission(formData: FormData) {
  const userId = await requireUserId();

  const exerciseId = Number(formData.get("exerciseId"));
  const intent = formData.get("intent"); // "draft" | "submit"
  const prLink = String(formData.get("prLink") || "").trim();
  const learnerNote = String(formData.get("learnerNote") || "").trim();

  const exercise = await prisma.exercise.findUniqueOrThrow({
    where: { id: exerciseId },
    include: { competency: true },
  });

  const submission = await getOrCreateSubmission(userId, exerciseId);

  const artifacts: {
    checklistLabel: string;
    kind: "link";
    url: string;
  }[] = [];
  for (const item of evidenceChecklist(exercise)) {
    const url = String(
      formData.get(`evidence:${item.label}`) || "",
    ).trim();
    if (url) {
      artifacts.push({ checklistLabel: item.label, kind: "link", url });
    }
  }

  await prisma.$transaction([
    prisma.evidenceArtifact.deleteMany({
      where: { submissionId: submission.id },
    }),
    prisma.evidenceArtifact.createMany({
      data: artifacts.map((a) => ({ ...a, submissionId: submission.id })),
    }),
    prisma.submission.update({
      where: { id: submission.id },
      data: {
        prLink: prLink || null,
        learnerNote: learnerNote || null,
        ...(intent === "submit"
          ? { status: "submitted" as const, submittedAt: new Date() }
          : {}),
      },
    }),
  ]);

  revalidatePath(`/competencies/${exercise.competency.number}/exercises/${exercise.number}`);
  revalidatePath("/dashboard");
  redirect(`/submissions/${submission.id}`);
}

export async function decideSubmission(formData: FormData) {
  const facilitatorId = await requireFacilitatorId();

  const submissionId = Number(formData.get("submissionId"));
  const decision = formData.get("decision"); // "passed" | "needs_rework"
  const facilitatorComment = String(
    formData.get("facilitatorComment") || "",
  ).trim();

  if (decision !== "passed" && decision !== "needs_rework") {
    throw new Error("Invalid decision");
  }

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { exercise: { include: { competency: true } } },
  });

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: decision,
      decidedAt: new Date(),
      decidedById: facilitatorId,
      facilitatorComment: facilitatorComment || null,
    },
  });

  revalidatePath(`/submissions/${submissionId}`);
  revalidatePath(
    `/competencies/${submission.exercise.competency.number}/exercises/${submission.exercise.number}`,
  );
  revalidatePath("/admin/roster");
  redirect("/admin/roster");
}
