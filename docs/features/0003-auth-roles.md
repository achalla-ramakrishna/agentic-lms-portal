# Feature spec — Chunk 3: Auth & Roles

Written before implementation, per Competency 02 (Spec Framing) — "Spec
Driven Feature Development." Implementation must match this doc; if
reality diverges during build, this doc gets updated in the same commit,
not silently ignored.

## Goal

A learner or facilitator can log in with an email + password and reach
role-appropriate pages. Everything under `/competencies/**` requires a
session; `/admin/**` additionally requires the `facilitator` role. Landing
(`/`) and `/login` stay public.

## Non-goals (explicitly deferred)

- SSO / OAuth providers — no identity provider confirmed (ADR 0002 Q4).
  `lib/auth.ts` is structured so adding a provider later doesn't touch the
  `role` model.
- Self-service signup — v1 is invite-only (facilitator creates accounts);
  for this chunk, accounts are seeded, not self-registered. A "Facilitator
  creates a learner account" admin flow is chunk 5+ (roster) scope, not
  this one.
- Password reset — out of scope for v1; a facilitator can reset a
  password directly in the DB if needed. Not building a flow for it now.

## User-facing behavior

1. Anonymous visitor hits `/` → sees the existing landing page, "Log in"
   CTA → `/login`.
2. Anonymous visitor hits any `/competencies/**` URL directly → redirected
   to `/login?callbackUrl=<original-url>`; after successful login, sent
   back to that URL (standard NextAuth `callbackUrl` behavior, not custom
   code).
3. `/login` — email + password form. Wrong credentials → inline error,
   no information about which field was wrong (don't leak whether an
   email exists).
4. On success → session cookie set, redirect per callbackUrl (default
   `/competencies` — `/dashboard` doesn't exist until chunk 4).
5. A `learner`-role session hitting `/admin/**` → `403` (rendered, not a
   silent redirect — the difference between "not logged in" and "logged
   in but not allowed" should be visible).
6. Logged-in pages show the current user's name/email and a "Log out"
   link (minimal header, not the full nav from the wireframe — that's
   chunk 4's dashboard shell).

## Data model

No schema changes — `User.role` (`learner|facilitator`) and
`User.passwordHash` already exist (chunk 2). This chunk only adds seeded
rows and the auth wiring that reads them.

Seed adds two demo accounts (dev-only, clearly fake, documented in
README): one `learner`, one `facilitator`. Real accounts replace these
once there's an actual cohort — not this chunk's problem.

## Implementation

- `next-auth@4.24.x` (stable; v5 is still beta — see the same
  conservative-version reasoning as ADR 0001) with the Credentials
  provider.
- `bcryptjs` for password hashing (pure JS, no native build step — avoids
  the `bcrypt` package's node-gyp dependency, one less thing that can
  fail `npm install` in a fresh clone).
- `lib/auth.ts` — `authOptions`: Credentials provider validates against
  `prisma.user`, JWT session strategy (no separate session table needed
  for v1's scale), callbacks inject `role` and `id` onto the session.
- `app/api/auth/[...nextauth]/route.ts` — the NextAuth route handler.
- `middleware.ts` — protects `/competencies/**` and `/admin/**` at the
  edge (redirect-to-login for no session; the `learner`-on-`/admin`
  403 case is handled in a server component, since middleware returning a
  friendly 403 page requires more plumbing than it's worth here).
- `app/login/page.tsx` + a small client form component (needs
  `signIn()` from `next-auth/react`, which requires client-side JS).

## Acceptance criteria

- [ ] Visiting `/competencies` while logged out redirects to `/login`.
- [ ] Logging in as the seeded learner lands back on `/competencies`.
- [ ] Logging in as the seeded facilitator can reach `/admin` (a
  placeholder page is enough for this chunk — roster UI is chunk 5).
- [ ] Logging in as the seeded learner and visiting `/admin` renders a
  403, not a redirect loop or a crash.
- [ ] Wrong password shows one generic error, not a stack trace.
- [ ] `npm run build` succeeds; no secrets committed (seeded demo
  passwords are documented as fake in README, not disguised as real).
