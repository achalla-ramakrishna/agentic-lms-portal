import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { LoginForm } from "../LoginForm";
import { CodewalnutLogo } from "@/app/codewalnut-logo";

export const dynamic = "force-dynamic";

// The embed widget's destination (public/embed.js) — a company pastes a
// <script data-company="their-slug"> snippet into their own portal, and
// clicking the button it renders opens this page in a new tab. Same
// LoginForm, same Credentials auth, same post-login role routing as
// plain /login — only the branding around it changes. An unknown slug
// (typo'd snippet, a company that was since removed) falls back to
// plain, generic branding rather than 404ing, so a bad snippet never
// dead-ends a visitor — see docs/features/0016-embed-widget.md. A
// company that hasn't set its own logoUrl yet also gets the plain,
// generic look here — the CodeWalnut mark stays only in the small
// "Powered by" attribution below, never standing in as if it were the
// company's own logo (the white-labeling this exists for).
export default async function CompanyLoginPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
    select: { name: true, logoUrl: true, accentColor: true },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="flex items-center gap-3">
        {company?.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.logoUrl}
            alt={company.name}
            style={{ height: 28, width: "auto", display: "block" }}
          />
        )}
        <span className="text-lg font-semibold text-fg">
          {company?.name ?? "Agentic Engineering"} Training Portal
        </span>
      </div>

      {/* useSearchParams needs a Suspense boundary in the App Router */}
      <Suspense>
        <LoginForm
          accentColor={company?.accentColor ?? undefined}
        />
      </Suspense>

      <p className="text-sm text-fg-muted">
        New engineer? Ask your facilitator for an invite.
      </p>

      <Link
        href="/"
        className="flex items-center gap-2 text-xs text-fg-subtle hover:text-fg-muted"
      >
        Powered by <CodewalnutLogo height={14} />
      </Link>
    </main>
  );
}
