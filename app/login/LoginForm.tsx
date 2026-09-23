"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm({
  accentColor,
  companySlug,
}: {
  accentColor?: string;
  companySlug?: string;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // An explicit callbackUrl (proxy.ts sets one when redirecting a
  // logged-out visit to a specific protected page) always wins — that's
  // a deep link, not the generic "just logged in" case. Only the
  // generic case falls back to a role-based landing page: learners
  // don't belong on the reviewer's Roster, and a facilitator landing on
  // their own (empty) learner dashboard is exactly the "everything
  // mixed up" complaint this fixes. Per role (docs/features/
  // 0018-role-separation.md's clean split): facilitator/super_admin
  // land on Roster (the review side), company_admin lands on Users (the
  // management side) — Roster would 403 a company_admin, since it's no
  // longer their page.
  const explicitCallbackUrl = searchParams.get("callbackUrl");

  const ROLE_LANDING: Record<string, string> = {
    facilitator: "/admin/roster",
    super_admin: "/admin/roster",
    company_admin: "/admin/users",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // next-auth's signIn serializes credentials via URLSearchParams,
    // which stringifies `undefined` as the literal text "undefined"
    // rather than omitting the key — that string is truthy server-side,
    // so plain /login (no companySlug prop) was failing every login,
    // not just cross-company ones. Only include the key when it's a
    // real value.
    const result = await signIn("credentials", {
      email,
      password,
      ...(companySlug ? { companySlug } : {}),
      redirect: false,
    });

    if (!result || result.error) {
      setSubmitting(false);
      // Deliberately generic — covers a wrong password AND a right
      // password for an account that belongs to a different company
      // than this branded page (lib/auth.ts) — same message either
      // way, so a login attempt here never reveals which company an
      // email address actually belongs to.
      setError("Incorrect email or password.");
      return;
    }

    const session = await getSession();
    const target =
      explicitCallbackUrl ||
      (session?.user.role ? ROLE_LANDING[session.user.role] : undefined) ||
      "/dashboard";

    router.push(target);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-line bg-canvas-subtle p-6"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-fg">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-fg">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-danger-fg">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        style={accentColor ? { backgroundColor: accentColor } : undefined}
        className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
          accentColor
            ? "hover:opacity-90"
            : "bg-success-emphasis hover:bg-success-emphasis-hover"
        }`}
      >
        {submitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
