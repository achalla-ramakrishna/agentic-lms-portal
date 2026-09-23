import { requireCurrentUser } from "@/lib/current-user";
import { updateProfile, changePassword } from "@/app/actions";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Name and email are both required.",
  email_taken: "That email is already in use by another account.",
  password_too_short: "New password must be at least 8 characters.",
  password_mismatch: "New password and confirmation don't match.",
  current_password_wrong: "Current password is incorrect.",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    updated?: string;
    password_changed?: string;
  }>;
}) {
  const { error, updated, password_changed } = await searchParams;
  const user = await requireCurrentUser();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">Profile</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Your account details, and where you update your name, email, or
        password.
      </p>

      {updated && (
        <div className="mt-4 rounded-lg border border-success-fg/40 bg-success-subtle px-4 py-3 text-sm text-success-fg">
          Profile updated.
        </div>
      )}
      {password_changed && (
        <div className="mt-4 rounded-lg border border-success-fg/40 bg-success-subtle px-4 py-3 text-sm text-success-fg">
          Password changed.
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-lg border border-danger-fg/40 bg-danger-subtle px-4 py-3 text-sm text-danger-fg">
          {ERROR_MESSAGES[error] ?? "Something went wrong."}
        </div>
      )}

      <section className="mt-8 rounded-xl border border-line bg-canvas-subtle p-7">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
            Account details
          </h2>
          <span className="flex flex-wrap gap-1.5">
            {user.roles.map((r) => (
              <span
                key={r}
                className="rounded-full border border-line px-2.5 py-0.5 text-xs font-medium capitalize text-fg-muted"
              >
                {r.replace("_", " ")}
              </span>
            ))}
          </span>
        </div>
        <form action={updateProfile} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-fg">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={user.name}
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
              defaultValue={user.email}
              className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-fg-subtle">
              You&apos;ll sign in with this email going forward.
            </p>
          </div>
          <button
            type="submit"
            className="self-end rounded-md bg-accent-emphasis px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Save changes
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Change password
        </h2>
        <form action={changePassword} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="currentPassword" className="text-sm font-medium text-fg">
              Current password
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="newPassword" className="text-sm font-medium text-fg">
              New password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-fg">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="self-end rounded-md bg-success-emphasis px-4 py-2 text-sm font-medium text-white hover:bg-success-emphasis-hover"
          >
            Update password
          </button>
        </form>
      </section>
    </main>
  );
}
