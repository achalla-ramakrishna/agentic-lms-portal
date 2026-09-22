"use server";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect, forbidden } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOrCreateSubmission } from "@/lib/submissions";
import { evidenceChecklist } from "@/lib/content";
import { canStart, canSubmitEvidence, canDecide, isValidDecision } from "@/lib/status";
import type { Role } from "@prisma/client";

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
  if (canStart(submission.status)) {
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
  if (submission.status !== "not_started" && !canSubmitEvidence(submission.status)) {
    // e.g. already passed — don't let a stale form resubmit over a
    // closed-out exercise (docs/features/0006-polish.md).
    forbidden();
  }

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

  if (!isValidDecision(decision)) {
    throw new Error("Invalid decision");
  }

  const submission = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { exercise: { include: { competency: true } } },
  });
  if (!canDecide(submission.status)) {
    // Already decided, or not submitted yet — don't let a stale form
    // double-apply a decision (docs/features/0006-polish.md).
    forbidden();
  }

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

// The only way an account gets made — no self-signup (docs/SPEC.md §1
// out-of-scope, resolved by adding this instead). The facilitator sets a
// temporary password directly rather than the app emailing one, matching
// this app's existing no-email-integration stance (ADR 0002 Q4/Q6) —
// they share it with the new user out of band.
export async function createUser(formData: FormData) {
  await requireFacilitatorId();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = formData.get("role");

  if (
    !name ||
    !email ||
    password.length < 8 ||
    (role !== "learner" && role !== "facilitator")
  ) {
    redirect("/admin/users?error=invalid");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect("/admin/users?error=email_taken");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, passwordHash, role: role as Role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?created=1");
}

// Any signed-in user editing their own name/email — re-derives userId
// from the session rather than trusting a hidden form field, so nobody
// can edit someone else's account by tampering with the request.
export async function updateProfile(formData: FormData) {
  const userId = await requireUserId();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();

  if (!name || !email) {
    redirect("/account?error=invalid");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    redirect("/account?error=email_taken");
  }

  await prisma.user.update({ where: { id: userId }, data: { name, email } });

  revalidatePath("/account");
  revalidatePath("/dashboard");
  redirect("/account?updated=1");
}

// Requires the current password (not just an active session) so a
// hijacked/left-open session can't be used to lock the real owner out.
export async function changePassword(formData: FormData) {
  const userId = await requireUserId();

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (newPassword.length < 8) {
    redirect("/account?error=password_too_short");
  }
  if (newPassword !== confirmPassword) {
    redirect("/account?error=password_mismatch");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    redirect("/account?error=current_password_wrong");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  redirect("/account?password_changed=1");
}
