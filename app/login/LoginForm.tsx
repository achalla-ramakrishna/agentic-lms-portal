"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // An explicit callbackUrl (proxy.ts sets one when redirecting a
  // logged-out visit to a specific protected page) always wins — that's
  // a deep link, not the generic "just logged in" case. Only the
  // generic case falls back to a role-based landing page: learners
  // don't belong on the reviewer's Roster, and a facilitator landing on
  // their own (empty) learner dashboard is exactly the "everything
  // mixed up" complaint this fixes.
  const explicitCallbackUrl = searchParams.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setSubmitting(false);
      // Deliberately generic — don't reveal whether the email exists.
      setError("Incorrect email or password.");
      return;
    }

    const session = await getSession();
    const target =
      explicitCallbackUrl ||
      (session?.user.role === "facilitator" ? "/admin/roster" : "/dashboard");

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
        className="rounded-md bg-success-emphasis px-4 py-2 text-sm font-medium text-white hover:bg-success-emphasis-hover disabled:opacity-50"
      >
        {submitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
