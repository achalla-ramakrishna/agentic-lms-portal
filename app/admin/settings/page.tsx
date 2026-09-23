import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { requireCurrentUser } from "@/lib/current-user";
import { updateCompanyBranding } from "@/app/actions";
import { EmbedSnippet } from "./EmbedSnippet";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_logo_url: "That doesn't look like a valid http(s) logo URL.",
  invalid_accent_color: "Accent color must be a 6-digit hex code like #3fb950.",
};

// Company settings (branding) + the embed snippet a company pastes into
// their own portal — docs/features/0016-embed-widget.md. Reachable by
// facilitator or company_admin (app/admin/layout.tsx's gate); the
// underlying action, updateCompanyBranding, checks the same pair again
// server-side.
export default async function CompanySettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; updated?: string }>;
}) {
  const { error, updated } = await searchParams;
  const currentUser = await requireCurrentUser();
  const company = await prisma.company.findUniqueOrThrow({
    where: { id: currentUser.companyId },
  });

  const host = (await headers()).get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;
  const snippet = `<script src="${origin}/embed.js" data-company="${company.slug}" async></script>`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-fg">
        Company Settings
      </h1>
      <p className="mt-1 text-sm text-fg-muted">
        Branding for {company.name}&apos;s login page, and the snippet to
        embed this training portal in your own site.
      </p>

      {updated && (
        <div className="mt-4 rounded-lg border border-success-fg/40 bg-success-subtle px-4 py-3 text-sm text-success-fg">
          Settings saved.
        </div>
      )}
      {error && (
        <div className="mt-4 rounded-lg border border-danger-fg/40 bg-danger-subtle px-4 py-3 text-sm text-danger-fg">
          {ERROR_MESSAGES[error] ?? "Something went wrong."}
        </div>
      )}

      <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Branding
        </h2>
        <form action={updateCompanyBranding} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="logoUrl" className="text-sm font-medium text-fg">
              Logo URL
            </label>
            <input
              id="logoUrl"
              name="logoUrl"
              type="url"
              placeholder="https://your-company.com/logo.png"
              defaultValue={company.logoUrl ?? ""}
              className="rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
            />
            <p className="text-xs text-fg-subtle">
              Shown on your branded login page ({origin}/login/{company.slug}).
              Leave blank to use the default CodeWalnut logo.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="accentColor" className="text-sm font-medium text-fg">
              Accent color
            </label>
            <div className="flex items-center gap-2">
              <input
                id="accentColor"
                name="accentColor"
                type="text"
                placeholder="#3fb950"
                pattern="^#[0-9a-fA-F]{6}$|^$"
                defaultValue={company.accentColor ?? ""}
                className="w-40 rounded-md border border-line bg-canvas-inset px-3 py-2 text-sm text-fg focus:border-accent focus:outline-none"
              />
              {company.accentColor && (
                <span
                  className="h-6 w-6 rounded-full border border-line"
                  style={{ backgroundColor: company.accentColor }}
                  aria-hidden="true"
                />
              )}
            </div>
            <p className="text-xs text-fg-subtle">
              6-digit hex code, used for the Log in button on your branded
              login page. Leave blank for the default green.
            </p>
          </div>
          <button
            type="submit"
            className="self-end rounded-md bg-success-emphasis px-4 py-2 text-sm font-medium text-white hover:bg-success-emphasis-hover"
          >
            Save
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-canvas-subtle p-7">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Embed this portal
        </h2>
        <p className="mt-2 text-sm text-fg-muted">
          Paste this snippet anywhere in your own company portal. It renders
          a single button — clicking it opens your branded login page above
          in a new tab. No other setup needed.
        </p>
        <div className="mt-4">
          <EmbedSnippet snippet={snippet} />
        </div>
      </section>
    </main>
  );
}
