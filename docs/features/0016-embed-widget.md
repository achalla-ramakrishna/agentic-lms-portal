# Feature spec — Embed widget, branded login page, and company settings

Written before implementation, per this repo's convention. Prompted by:
"company can have a portal, we should be able to add a small snippet
and integrate our lms portal in it. we should use company header,
footer etc. once they select the link, for now login page can appear
and our lms portal can be active" — then, when asked to weigh iframe
vs. new-tab and manual vs. self-serve branding, the user handed the
call over: "i am not be great at this planning ... how best we can do,
so that we can integrate this to 100 companies."

## The decisions this makes, and why

**Open in a new tab, not an iframe.** An iframe embed would need this
app to send `Content-Security-Policy: frame-ancestors` allow-listing
every company's domain — meaning either we maintain a 100-entry
allowlist by hand, or send a wildcard that defeats the point of having
one — plus real work around third-party-cookie blocking breaking the
login session inside an iframe on most current browsers. A new tab
needs none of that: zero per-company server configuration, works
identically for company #1 and company #100. This is the same tradeoff
Calendly/Stripe "buy button"-style embeds make, for the same reason.

**One static, generic script — no per-company code.** `public/embed.js`
is driven entirely by a `data-company="slug"` attribute on the script
tag. Onboarding company #101 is a `Company` row with a slug, not a new
route or a new build. This is what "easy to integrate to other
companies" actually requires: the marginal cost of company N+1 has to
be zero engineering work, not just zero for the company embedding it.

**Branding is a URL + hex color, not a file-upload pipeline.** A
company's logo is already hosted somewhere (their own marketing site,
usually); asking for a URL costs us nothing to build and is still
genuinely self-serve — a `facilitator` or `company_admin` types it into
a form themselves, no file storage, no image processing, no CDN
decision to make right now. Building real upload infrastructure before
any real company has asked for it would be exactly the kind of
speculative pre-building this repo's own ADRs have avoided elsewhere.

**This is `company_admin`'s first real behavior.** ADR 0004 added the
role to the enum inert, deferring what it does. This is that decision,
scoped narrowly: `company_admin` (and `facilitator`, unchanged) can
reach `/admin/**` read-only and can save their company's branding.
`createUser` and `decideSubmission` are untouched — still
`facilitator`-only — so nothing about who can add users or grade
submissions changes.

## Non-goals

- Self-serve company *creation* — still seeded, per ADR 0004. "100
  companies" here means 100 companies we've onboarded, each configuring
  their own branding/snippet, not 100 companies signing themselves up.
- Iframe embedding, SSO/SAML — the harder integration paths ADR 0004
  named as future work, unchanged by this.
- File upload for logos, custom fonts, full page theming. The accent
  color touches exactly one thing: the Log in button on the branded
  login page. The rest of that page, and the entire app after login,
  is unchanged.
- Any change to who can create users or decide submissions.

## Implementation

- `Company` gains `logoUrl String?` and `accentColor String?` (hex),
  both optional — an empty value falls back to default CodeWalnut
  branding. Additive nullable-column migration.
- `lib/company-branding.ts` (new) — `isValidLogoUrl` (http(s) only, so a
  company can't put a `javascript:` URL into an `<img src>` that renders
  on our own login page) and `isValidAccentColor` (6-digit hex or
  empty). Pure, unit tested.
- `app/actions.ts` — `updateCompanyBranding`, gated by a new
  `requireCompanyStaff()` helper (facilitator or company_admin,
  deliberately narrower in scope than widening `requireFacilitator()`
  itself, which stays reserved for review/user-management actions).
- `app/admin/layout.tsx` — the `/admin/**` role gate now admits
  `company_admin` too (previously facilitator-only). `RoleViewSwitcher`
  (the reviewer/learner preview toggle) is hidden for `company_admin` —
  it has no learner identity to preview.
- `app/login/[companySlug]/page.tsx` (new) — the embed's destination.
  Looks up `Company` by slug; shows its logo (or the default) and an
  accent-colored `LoginForm`. An unknown slug falls back to plain
  CodeWalnut branding rather than 404ing — a stale/typo'd snippet
  should never dead-end a visitor. Same `LoginForm`, same Credentials
  auth, same post-login role routing as plain `/login` — only the
  surrounding branding differs.
- `app/login/LoginForm.tsx` — gained an optional `accentColor` prop
  (defaults to the existing green when absent), applied only to the
  submit button. `/login/page.tsx` (plain login) is unchanged — it
  still renders `<LoginForm />` with no props.
- `public/embed.js` (new) — the snippet's actual JS. Vanilla, no
  dependencies, no build step: finds its own `<script data-company>`
  tag, computes its own origin from `current.src` (so the same file
  works unmodified in dev/staging/prod), renders a button, opens
  `/login/:slug` on click.
- `app/admin/settings/page.tsx` + `EmbedSnippet.tsx` (new) — the
  branding form and a copy-to-clipboard embed snippet block (same
  copy-button pattern as `GuidanceDocs.tsx`), reachable via a new
  "Company Settings" link in `AdminSidebar`.

## Acceptance criteria

- [x] `npm run build` clean, `npx vitest run` all passing including new
  `company-branding.test.ts`.
- [x] Fresh reseed + live Playwright: `/admin/settings` renders the
  correct snippet for the seeded company's slug; saving a logo URL and
  accent color persists and shows up on `/login/codewalnut`.
- [x] An unknown slug at `/login/:slug` renders plain CodeWalnut
  branding, not a 404, and logs in successfully.
- [x] Embedding `public/embed.js` in a plain HTML page and clicking the
  rendered button opens the branded login page in a new tab.
- [x] Existing `/login` (no slug) and its post-login role routing are
  byte-for-byte unchanged.
- [x] A learner or facilitator account, unaffected: `/admin/**` access
  for `facilitator` accounts is identical to before this change.
