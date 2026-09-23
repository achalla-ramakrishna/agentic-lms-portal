# ADR 0002 — v1 scope decisions (resolves product spec §10 open questions)

## Status
Accepted

## Decisions

**Q1 — Single-org confirmation.** Treated as internal-only, single
organization. No `org_id` added to `user`/`cohort` for v1 — the product
spec explicitly flags multi-tenancy as out of scope and a genuine product
pivot (Phase 3), not a cheap-to-add-later toggle worth pre-building.
**Reopened 2026-09-23** — see `docs/adr/0004-multi-tenant-companies.md`,
which adds a `Company` entity and `companyId` scoping (chunk 16). That
ADR's "Backfill" decision is what keeps this reopening non-disruptive:
every user this Q1 originally treated as "the one organization" is
backfilled into a single seeded company, so nothing here actually
changes in effect until a second company exists.

**Q2 — Exercise ordering.** Open by default: learners can browse and
attempt any exercise in any order. No locked/unlocked derived state on
`submission`. Matches the exercise-set repo's own README ("pick one
competency folder, pick one exercise") and the spec's own recommendation.

**Q3 — Evidence storage.** Link-only for v1: a submission's evidence is a
set of `(checklistLabel, url, note)` rows — no object storage, no file
upload. This is the spec's own lower-effort recommendation and is
sufficient since the exercise-set repo's standard already expects evidence
to live in the learner's own PR/branch.

**Q4 — Identity provider.** No SSO confirmed available. v1 uses NextAuth's
Credentials provider with seeded demo accounts (one learner, one
facilitator) rather than building or assuming SSO. Swapping in a Google
Workspace/Okta provider later is additive in `lib/auth.ts`, not a
data-model change (`user.role` already models roles generically).

**Q5 — Content sync cadence.** Seed script (`prisma/seed.ts`, chunk 2) is
idempotent, upserting by `slug`/`number`, so re-running it against an
updated `content/seed.json` is safe and non-destructive by design from the
start.

**Q6 — Facilitator capacity / Stage 2 CI.** Deferred to Phase 2 per the
spec's own sequencing logic — v1 ships the full manual review flow (Flow B)
first; automated `verify:exercise` integration is Phase 2 once real usage
data shows manual review doesn't scale for the actual cohort size.

## Not decided here
Cohorts (`cohort` table, "quiet for 7+ days" roster signal) are Phase 2 per
the original spec's roadmap — not re-litigated in this ADR.
