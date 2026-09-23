# Feature spec — Restrict a company's branded login page to its own users

Written before implementation, per this repo's convention. Prompted by
the user testing the live Acme Robotics demo portal and reporting:
"acme learning portal should give acme data only and not codewalnut."

## The problem, confirmed against the real app

Reproduced exactly as reported before touching any auth code: logging
in at `/login/acme-robotics` (Acme's branded page, reached via the
embed widget — `0016-embed-widget.md`) with a valid **CodeWalnut**
credential succeeded, and correctly showed that user's own CodeWalnut
data — company scoping (`0015-companies-roles.md`) was never actually
broken. But from the outside, a CodeWalnut account authenticating on
Acme's own portal and landing on CodeWalnut data reads exactly like
"the Acme portal is leaking the wrong company's data." The real gap:
`/login/:slug` never checked *who* was allowed to log in there — any
valid credential from any company worked, because `LoginForm`/
`authorize()` had no notion of which company's page a login attempt
came from.

## Goal

A company's branded login page authenticates only that company's own
users. A different company's valid credentials are rejected there,
with the same generic message a wrong password gets — never a message
that confirms or denies which company an email address belongs to,
which would itself leak information the page shouldn't reveal.

## Non-goals

- Restricting plain `/login`. It stays exactly as unrestricted as
  before — any valid credential works there, same as every other
  company's login already did before branded pages existed. Only a
  known `/login/:slug` gets the restriction.
- Any change to what happens *after* a successful login — role-based
  landing (`0018-role-separation.md`'s `ROLE_LANDING`), company
  scoping, and multi-role (`0019-multi-role.md`) are all unaffected;
  this only decides whether `authorize()` returns a user at all.
- Locking out an unknown/typo'd slug. `/login/:companySlug` for a slug
  that doesn't match any `Company` row has no real company to
  restrict to, so it falls back to the same unrestricted behavior as
  plain `/login` (matching `0016-embed-widget.md`'s "a bad snippet
  never dead-ends a visitor").

## Implementation

- `lib/auth.ts` — `CredentialsProvider` gains an optional `companySlug`
  credential. When present (and not the literal string `"undefined"`
  — see below), `authorize()` looks up that slug's `Company` and
  rejects (`return null`, the same path a wrong password takes) unless
  it matches the authenticating user's own `companyId`.
- `app/login/[companySlug]/page.tsx` — passes the resolved company's
  `slug` into `<LoginForm companySlug={...}>`. An unknown slug leaves
  `company` (and so `companySlug`) `undefined`, preserving the
  no-dead-end fallback.
- `app/login/LoginForm.tsx` — forwards `companySlug` into `signIn()`
  **only when truthy** (`...(companySlug ? { companySlug } : {})`),
  not unconditionally. NextAuth's client serializes `signIn()`
  credentials via `URLSearchParams`, which stringifies a JS
  `undefined` as the literal text `"undefined"` rather than omitting
  the key — sent unconditionally, that string arrives at
  `authorize()` as a truthy, non-matching value and broke *every*
  login, not just cross-company ones, until this was found by
  inspecting the actual failed network response and reasoning through
  the serialization. `lib/auth.ts` also defensively rejects that exact
  string server-side, so a future regression here fails safe (treated
  as "no restriction requested") rather than as an unexplained login
  failure.

## Acceptance criteria

- [x] A CodeWalnut credential is rejected at `/login/acme-robotics`
      with the generic "Incorrect email or password" message.
- [x] An Acme credential still logs in successfully at
      `/login/acme-robotics` and sees only Acme's own data.
- [x] Any valid credential still logs in successfully at plain
      `/login`, unrestricted, exactly as before this change.
- [x] An unknown `/login/:slug` remains unrestricted (same as plain
      `/login`), not a dead end.
