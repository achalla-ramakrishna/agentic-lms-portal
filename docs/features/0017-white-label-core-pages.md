# Feature spec — Remove the CodeWalnut logo from core app pages

Written before implementation, per this repo's convention. Prompted
directly, following the embed widget (0016): "can you use codewalnut
logo and remove from the core pages, so that integration is easy" —
clarified to mean the CodeWalnut mark should come out of every
company-agnostic page, so the product reads as a white-label training
portal rather than "CodeWalnut's own tool," which is exactly what
makes embedding it into 100 different companies' portals feel right.

## Scope, as confirmed

Removed everywhere in the core app: the landing page (`/`), plain
`/login`, the learner shell header (`AppHeader`), and the
reviewer/admin shell header (`app/admin/layout.tsx`). A small "Powered
by CodeWalnut" attribution stays on the per-company branded login page
(`/login/:slug`, from 0016) — the one place a CodeWalnut credit is
actually appropriate, since that page is explicitly the vendor-hosted
entry point a company embeds.

## What changed

- Every `<CodewalnutLogo />` usage in `app/page.tsx`, `app/login/
  page.tsx`, `app/app-header.tsx`, and `app/admin/layout.tsx` removed.
  Each place kept its text wordmark ("Agentic Engineering" /
  "Agentic Engineering — Reviewer") — previously `hidden` below the
  `sm:`/`md:` breakpoint (the logo carried brand identity on mobile,
  text didn't need to). Now that there's no logo, the text is always
  visible instead, so mobile headers aren't left blank.
- The landing page's "crafted by [CodeWalnut logo]" footer line removed
  outright, not replaced — it was a pure CodeWalnut credit with no
  other content to keep.
- `app/login/[companySlug]/page.tsx` — the fallback for a company that
  hasn't set its own `logoUrl` yet no longer shows the CodeWalnut logo
  in that slot. Previously this was misleading: a company with no logo
  configured would show *CodeWalnut's* mark as if it were their own
  company's branding. Now it shows just the company name as text,
  consistent with every other de-branded core page. The **"Powered by
  CodeWalnut"** attribution at the bottom of that same page is
  unchanged — that one is correct in context (crediting the platform
  vendor), not a stand-in for the company's own identity.
- `app/admin/settings/page.tsx` — the logo-URL field's help text
  updated ("Leave blank to show just your company name, no logo"),
  since it no longer falls back to the CodeWalnut mark.

## Non-goals

- `app/codewalnut-logo.tsx` itself is unchanged and still exported —
  still used by the one remaining "Powered by" attribution. Not
  deleted, since it's not dead code.
- No new logo or brand mark invented to fill the removed space. A
  plain text wordmark is the whole change — inventing a placeholder
  visual identity wasn't asked for.
- The embed demo package (a downloadable zip, not part of this repo)
  is a separate artifact, not updated by this commit.

## Acceptance criteria

- [x] `npm run build` clean, `npx vitest run` 91/91 (no test touches
  UI markup, so an unrelated pass here confirms nothing else broke).
- [x] Fresh reseed + live screenshots: landing page, plain `/login`,
  learner header (post-login), admin/reviewer header — none show the
  CodeWalnut logo.
- [x] `/login/codewalnut` (a real seeded company with no `logoUrl` set)
  shows no logo image, just "CodeWalnut Training Portal" as text — and
  still shows "Powered by CodeWalnut" at the bottom.
- [x] `grep -rn "CodewalnutLogo" app --include="*.tsx"` returns exactly
  one usage site (the "Powered by" line) plus the component's own
  definition.
