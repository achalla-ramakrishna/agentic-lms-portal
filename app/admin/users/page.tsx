import { forbidden } from "next/navigation";
import { prisma } from "@/lib/db";
import { createUser } from "@/app/actions";
import { requireCurrentUser } from "@/lib/current-user";
import { resolveEffectiveCompany, parseCompanyIdParam } from "@/lib/company-scope";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invalid:
    "Fill in a name, a valid email, a password of at least 8 characters, and a role.",
  email_taken: "A user with that email already exists.",
};

// company_admin/super_admin only — managing users is not facilitator's
// job under the clean split (docs/features/0018-role-separation.md,
// 0019-multi-role.md).
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; companyId?: string }>;
}) {
  const { error, created, companyId: companyIdParam } = await searchParams;
  const currentUser = await requireCurrentUser();
  if (!currentUser.roles.includes("company_admin") && !currentUser.roles.includes("super_admin")) {
    forbidden();
  }
  const company = await resolveEffectiveCompany(currentUser, parseCompanyIdParam(companyIdParam));

  const users = await prisma.user.findMany({
    where: { companyId: company.id },
    orderBy: { id: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Users</h1>
      {currentUser.roles.includes("super_admin") && (
        <p className="mt-1 text-sm text-fg-muted">Showing {company.name}.</p>
      )}
      <p className="mt-1 text-sm text-fg-muted">
        Every account here only exists because someone added it below or
        seeded it — there&apos;s no signup. A new account can log in
        immediately with the password you set; share it with them directly,
        since there&apos;s no email step.
      </p>

      {created && (
        <div className="mt-4 rounded-lg border border-success-fg/40 bg-success-subtle px-4 py-3 text-sm text-success-fg">
          User created.
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-lg border border-danger-fg/40 bg-danger-subtle px-4 py-3 text-sm text-danger-fg">
          {ERROR_MESSAGES[error] ?? "Something went wrong."}
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-xl border border-line bg-canvas-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-fg-muted">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-line-muted">
                <td className="px-4 py-3 font-medium text-fg">{u.name}</td>
                <td className="px-4 py-3 text-fg-muted">{u.email}</td>
                <td className="px-4 py-3 capitalize text-fg">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 rounded-xl border border-line bg-canvas-subtle p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Add a user
        </h2>
        <form action={createUser} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="companyId" value={company.id} />
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-fg">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-fg">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-fg">
              Temporary password
            </label>
            <input
              id="password"
              name="password"
              type="text"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-fg-subtle">
              Shown as plain text so you can double-check it before sharing it
              — it isn&apos;t stored or shown again after this.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-fg">Role</span>
            <div className="flex gap-6 text-sm text-fg">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="learner"
                  defaultChecked
                  required
                />
                Learner
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="role" value="facilitator" />
                Facilitator
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="role" value="company_admin" />
                Company Admin
              </label>
            </div>
          </div>
          <button
            type="submit"
            className="self-end rounded-md bg-success-emphasis px-4 py-2 text-sm font-medium text-white hover:bg-success-emphasis-hover"
          >
            Add user
          </button>
        </form>
      </section>
    </main>
  );
}
