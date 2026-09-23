import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

// The JWT session (lib/auth.ts uses the "jwt" strategy) only carries a
// snapshot of name/email/roles taken at login. Editing your profile
// (app/(app)/account/page.tsx) updates the User row but not that token,
// so anywhere the current name/email is actually *displayed* — not just
// used as an id — should read it fresh here instead of trusting
// session.user, or an edit wouldn't show up until the next login.
export async function requireCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: Number(session.user.id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      extraRoles: { select: { role: true } },
    },
  });
  // A user's effective role set — see docs/features/
  // 0019-multi-role.md. `role` stays "the" primary role (default
  // landing page, Users table's headline column); `roles` is what
  // every permission check should actually test against, since a
  // company_admin who's also a facilitator genuinely holds both.
  const roles: Role[] = Array.from(
    new Set([user.role, ...user.extraRoles.map((r) => r.role)]),
  );
  return { ...user, roles };
}
