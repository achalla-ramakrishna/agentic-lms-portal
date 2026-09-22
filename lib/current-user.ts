import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// The JWT session (lib/auth.ts uses the "jwt" strategy) only carries a
// snapshot of name/email taken at login. Editing your profile
// (app/(app)/account/page.tsx) updates the User row but not that token,
// so anywhere the current name/email is actually *displayed* — not just
// used as an id — should read it fresh here instead of trusting
// session.user, or an edit wouldn't show up until the next login.
export async function requireCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  return prisma.user.findUniqueOrThrow({
    where: { id: Number(session.user.id) },
    select: { id: true, name: true, email: true, role: true },
  });
}
