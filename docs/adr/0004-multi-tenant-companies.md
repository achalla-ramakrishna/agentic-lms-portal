# ADR 0004 — Multi-tenant companies (reopens ADR 0002 Q1)

## Status
Accepted (v1 slice only — see docs/features/0015-companies-roles.md for
what's actually built vs. deferred)

## Context

ADR 0002 Q1 ruled multi-tenancy out of v1 as "a genuine product pivot,
not a cheap-to-add-later toggle." The user has now asked directly for
it: a `Company` entity, a company-aware role model, a company dashboard,
and the ability to plug this app into another company's portal. This
ADR records the three load-bearing decisions (isolation model, embed
model, content model) asked and answered directly, so the schema and
query changes that follow aren't guesswork.

## Decisions

**Isolation model — shared database, `companyId` column.** Every
tenant-scoped table gets a `companyId` FK; every query that lists or
aggregates across users is scoped by it. Chosen over DB-per-tenant or
schema-per-tenant because this app's current deployment (single SQLite
file on a Railway volume, ADR 0001) has no per-tenant provisioning story
at all — DB-per-tenant would be a deployment-model rebuild before it's
a schema change. The cost of this choice, stated plainly: every query
that touches `User`/`Submission`/`EvidenceArtifact` must filter by
`companyId`, and a missed filter is a real cross-tenant data leak, not
just a bug. `docs/features/0015-companies-roles.md` lists exactly which
queries were touched and how each is scoped.

**Content model — curriculum stays shared, not per-company.** The 12
competencies / 35 exercises remain global rows, not `companyId`-scoped.
Per-company curriculum customization would require the in-app authoring
UI this spec has explicitly ruled out since v1 (§1) — reopening that is
a separate, larger decision the user hasn't asked for yet.

**Backfill — every existing user becomes a CodeWalnut employee.** The
two original demo accounts, the 5-learner + reviewer realistic demo
cohort, and any other pre-existing `User` row are CodeWalnut's own
users, not an anonymous placeholder tenant. The migration seeds exactly
one company (`name: "CodeWalnut"`, `slug: "codewalnut"`) and backfills
every existing user's `companyId` to it before the column is made
required — no existing login, role, or submission history changes
meaning. This is the mechanism behind the explicit constraint that
existing functionality must not be disturbed: with every current user
in the same single company, every company-scoped query returns exactly
the same result set it did before scoping existed.

**Embed model — SSO/SAML is the target, not built in this pass.** The
user chose SSO/SAML login (reopening ADR 0002 Q4) over an iframe embed
or a headless API. This is recorded as the *direction*, not shipped
here: real SAML integration needs a specific identity provider to
integrate against (metadata, certs, ACS URL registration) that doesn't
exist yet for any seeded company, plus a library choice and a
per-company IdP-config store. Building it against nothing concrete
would be guessing at an interface no real IdP has validated. What *is*
built now: `Company` carries a `slug` (the eventual SSO routing key —
`/login/:companySlug` or an IdP-initiated relay state target) and
`User.companyId`, so wiring a real SAML provider later is additive to
the schema, not a redesign of it. The Credentials provider stays the
only working login path until a real company brings real IdP metadata.
**Superseded in part by `docs/features/0016-embed-widget.md`**: rather
than wait on SSO, the actual first embed mechanism shipped is a
new-tab launcher widget (`public/embed.js`) pointing at a
company-branded `/login/:slug` page — cheaper, no per-company CSP or
cookie work, and it's what "easy to integrate to 100 companies" turned
out to mean in practice. SSO/SAML remains the longer-term target for
a company that wants real single sign-on; the widget is not a
replacement for it, just the thing that shipped first.

## Not decided here

- Whether companies are created in-app (needs a platform-level role
  with no analogue in today's `learner | facilitator` enum) or only via
  seed/manual DB insert, the same way competencies are authored outside
  the app. **v1 ships with seed-only company creation** — see
  docs/features/0015-companies-roles.md's non-goals. A self-serve
  "create your company" signup flow is a real product decision (billing
  model, verification, abuse prevention) deferred until asked for.
- Real SAML wiring (see Embed model above) — still not built.
- What a `company_admin` can do differently from `facilitator`:
  **partially resolved by `docs/features/0016-embed-widget.md`** — a
  `company_admin` can now reach `/admin/**` read-only and save their
  company's branding/embed settings. Still `facilitator`-only:
  creating users, deciding submissions. Whether `company_admin` should
  eventually gain those too remains open.
