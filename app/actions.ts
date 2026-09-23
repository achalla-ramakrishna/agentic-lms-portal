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
import { isValidAccentColor, isValidLogoUrl } from "@/lib/company-branding";
import type { Role } from "@prisma/client";

async function requireUserId(): Promise<number> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  return Number(session.user.id);
}

// Reviews/decides submissions: facilitator (own company only) or
// super_admin (any company — docs/features/0018-role-separation.md's
// "clean split": facilitator and company_admin do not overlap, and
// super_admin is the one role with full cross-company control). A
// multi-role account (docs/features/0019-multi-role.md — e.g. a
// company_admin who's also a facilitator) qualifies if *either* role is
// in its set; session.user.roles is the full set computed at login
// (lib/auth.ts), not just the primary role.
async function requireReviewer(): Promise<{ id: number; companyId: number; roles: Role[] }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  // Re-checked here, not just trusted from the page that rendered the
  // form — a server action is a public endpoint regardless of which page
  // links to it (docs/features/0005-facilitator-flow.md acceptance
  // criteria).
  const roles = session.user.roles ?? [];
  if (!roles.includes("facilitator") && !roles.includes("super_admin")) {
    forbidden();
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: Number(session.user.id) },
    select: { id: true, companyId: true },
  });
  return { ...user, roles };
}

// Manages users and company settings/branding: company_admin (own
// company) or super_admin (any company). Deliberately excludes
// facilitator — under the clean split, reviewing submissions and
// managing a company are two different jobs, not one role doing both
// (docs/features/0018-role-separation.md), unless the same account
// genuinely holds both roles (0019-multi-role.md).
async function requireCompanyManager(): Promise<{ id: number; companyId: number; roles: Role[] }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  const roles = session.user.roles ?? [];
  if (!roles.includes("company_admin") && !roles.includes("super_admin")) {
    forbidden();
  }
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: Number(session.user.id) },
    select: { id: true, companyId: true },
  });
  return { ...user, roles };
}

// A super_admin acting on a company that isn't their own submits the
// target company's id in a hidden field (set by the page to whichever
// company it's currently showing — lib/company-scope.ts). Anyone else's
// submitted value is ignored outright — their own companyId always
// wins, so a company_admin/facilitator can never widen their own
// request by tampering with a hidden field.
async function resolveTargetCompanyId(
  actor: { companyId: number; roles: Role[] },
  formData: FormData,
): Promise<number> {
  if (!actor.roles.includes("super_admin")) return actor.companyId;
  const submitted = Number(formData.get("companyId"));
  if (!submitted) return actor.companyId;
  const company = await prisma.company.findUnique({ where: { id: submitted } });
  return company ? company.id : actor.companyId;
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
  const reviewer = await requireReviewer();

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
    include: { exercise: { include: { competency: true } }, user: true },
  });
  // A facilitator from another company guessing a submission id should
  // never be able to decide it — same company boundary as buildRoster()
  // (docs/features/0015-companies-roles.md). super_admin has no such
  // boundary — full cross-company control by design (docs/features/
  // 0018-role-separation.md).
  if (!reviewer.roles.includes("super_admin") && submission.user.companyId !== reviewer.companyId) {
    forbidden();
  }
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
      decidedById: reviewer.id,
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
  const manager = await requireCompanyManager();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = formData.get("role");

  // Preserves a super_admin's current CompanySwitcher selection across
  // the redirect (docs/features/0019-multi-role.md) — otherwise saving
  // the form would silently bounce them back to their own default
  // company's Users page instead of the one they were just managing.
  const submittedCompanyId = String(formData.get("companyId") || "");
  const companySuffix =
    manager.roles.includes("super_admin") && submittedCompanyId
      ? `&companyId=${submittedCompanyId}`
      : "";

  if (
    !name ||
    !email ||
    password.length < 8 ||
    (role !== "learner" && role !== "facilitator" && role !== "company_admin")
  ) {
    redirect(`/admin/users?error=invalid${companySuffix}`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/admin/users?error=email_taken${companySuffix}`);
  }

  const targetCompanyId = await resolveTargetCompanyId(manager, formData);
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as Role,
      companyId: targetCompanyId,
    },
  });

  revalidatePath("/admin/users");
  redirect(`/admin/users?created=1${companySuffix}`);
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

// Both fields are optional (empty string clears back to the default
// CodeWalnut look on /login/:slug) — see lib/company-branding.ts for
// why an empty string is valid but a malformed non-empty one isn't.
export async function updateCompanyBranding(formData: FormData) {
  const manager = await requireCompanyManager();

  const logoUrl = String(formData.get("logoUrl") || "").trim();
  const accentColor = String(formData.get("accentColor") || "").trim();

  // Same companyId-preservation as createUser — a super_admin editing
  // another company's branding shouldn't bounce back to their own
  // default company's settings page after saving.
  const submittedCompanyId = String(formData.get("companyId") || "");
  const companySuffix =
    manager.roles.includes("super_admin") && submittedCompanyId
      ? `&companyId=${submittedCompanyId}`
      : "";

  if (!isValidLogoUrl(logoUrl)) {
    redirect(`/admin/settings?error=invalid_logo_url${companySuffix}`);
  }
  if (!isValidAccentColor(accentColor)) {
    redirect(`/admin/settings?error=invalid_accent_color${companySuffix}`);
  }

  const targetCompanyId = await resolveTargetCompanyId(manager, formData);
  await prisma.company.update({
    where: { id: targetCompanyId },
    data: {
      logoUrl: logoUrl || null,
      accentColor: accentColor || null,
    },
  });

  // /login/:slug is force-dynamic (no caching to invalidate), so only
  // this settings page itself needs revalidating.
  revalidatePath("/admin/settings");
  redirect(`/admin/settings?updated=1${companySuffix}`);
}
