import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { CodewalnutLogo } from "@/app/codewalnut-logo";
import { templateCoverage } from "@/lib/template-coverage";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const coverage = await templateCoverage();
  const totalDocs = coverage.reduce((sum, c) => sum + c.totalDocs, 0);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <Link href="/" className="flex items-center gap-3">
        <CodewalnutLogo height={24} />
        <span className="text-lg font-semibold text-fg">
          Agentic Engineering
        </span>
      </Link>

      <p className="max-w-sm text-center text-sm text-fg-muted">
        {totalDocs} real templates &amp; guidance docs — pulled straight from
        the exercise-set repo across all {coverage.length} competencies, not
        generic advice.
      </p>

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
