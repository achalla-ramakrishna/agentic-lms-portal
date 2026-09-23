import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

export type EffectiveCompany = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  accentColor: string | null;
};

// Every /admin/** page that lists or aggregates company data calls this
// to decide *which* company it's showing. For everyone except
// super_admin, that's always their own companyId — a requestedCompanyId
// is ignored outright for anyone else, so a facilitator/company_admin
// can never widen their own view by hand-editing the URL. super_admin's
// selection comes from CompanySwitcher via a ?companyId= query param on
// whichever /admin/** page they're on (read by that page's own
// searchParams and passed in here) — see docs/features/
// 0019-multi-role.md. Checks the full role set, not just the primary
// role, so an account that holds super_admin as an *extra* role (not
// its primary/display role) still gets the switcher's selection
// honored, consistent with every other multi-role permission check in
// this codebase.
export async function resolveEffectiveCompany(
  currentUser: { roles: Role[]; companyId: number },
  requestedCompanyId?: number,
): Promise<EffectiveCompany> {
  const id =
    currentUser.roles.includes("super_admin") && requestedCompanyId
      ? requestedCompanyId
      : currentUser.companyId;

  const company = await prisma.company.findUnique({
    where: { id },
    select: { id: true, name: true, slug: true, logoUrl: true, accentColor: true },
  });
  // A stale/invalid ?companyId= (deleted company, typo) falls back to
  // the actor's own company rather than erroring the whole page.
  if (company) return company;
  return prisma.company.findUniqueOrThrow({
    where: { id: currentUser.companyId },
    select: { id: true, name: true, slug: true, logoUrl: true, accentColor: true },
  });
}

export function parseCompanyIdParam(value: string | undefined): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}
