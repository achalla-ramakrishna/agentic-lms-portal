import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <Link href="/" className="flex items-center gap-3">
        <span className="text-lg font-semibold text-fg">
          Agentic Engineering
        </span>
      </Link>
      {/* useSearchParams needs a Suspense boundary in the App Router */}
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="text-sm text-fg-muted">
        New engineer? Ask your facilitator for an invite.
      </p>
    </main>
  );
}
