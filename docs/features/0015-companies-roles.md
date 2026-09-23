# Feature spec — Companies, a company-aware role model, and a Company Dashboard

Written before implementation, per this repo's convention. Prompted by:
"can we add a company, roles etc, company dashboard, so that we can
make this as a SAAS product and it can be plugged in any of the company
portal" — scoped down to a concrete, safe v1 slice via
`docs/adr/0004-multi-tenant-companies.md`'s three decisions (shared DB +
`companyId` scoping, SSO as the eventual embed target, shared
curriculum), plus an explicit hard constraint from the user: **existing
functionality must not be disturbed.**

## Goal

- A `Company` entity every user belongs to.
- Every roster/dashboard/user-management query scoped by `companyId`,
  so a second company (once one exists) can never see another
  company's learners, submissions, or evidence.
- A genuinely new **Company Dashboard** (`/admin/company`) — the
  aggregate view a company owner would actually want: total learners,
  company-wide completion %, a status breakdown, and a company-wide
  competency bar chart — reusing the exact chart components the
  individual learner dashboard already uses (`ProgressRing`,
  `StatusDonut`, `CompetencyBarChart`), not new ones.
- Zero behavior change for anyone using the app today. Concretely: every
  current user (both original demo accounts plus the realistic 5-learner
  + reviewer cohort) is CodeWalnut's own data, backfilled into one
  seeded `Company` row, so with only one company in existence, every
  newly-scoped query returns the identical result set it returned
  before scoping existed.

## Non-goals (this pass)

- Real SSO/SAML wiring — decided as the target in ADR 0004, not built
  here; there's no real identity provider to integrate against yet.
- In-app company creation/signup. Companies are seeded, the same way
  competencies/exercises are seeded rather than authored in-app (§1 of
  `docs/SPEC.md`). A `company_admin`-tier self-serve flow is a real
  product/billing decision, not made here.
- Per-company curriculum customization — curriculum stays global.
- New behavior for the `company_admin` role. The enum value is added
  (avoids a second migration later) but nothing branches on it yet —
  see ADR 0004's "Not decided here".
- Any change to `learner`/`facilitator` capabilities. A facilitator
  still does exactly what a facilitator does today — the only change is
  that their roster/dashboard/user-management queries are now filtered
  to their own company, which for the current single-company world is
  unobservable.

## Data model

```
model Company {
  id        Int      @id @default(autoincrement())
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  users     User[]
}

enum Role {
  learner
  facilitator
  company_admin   // new — inert until a follow-up decides its behavior
}

model User {
  ...
  companyId Int
  company   Company @relation(fields: [companyId], references: [id])
}
```

`companyId` is required (`Int`, not `Int?`) — every user belongs to
exactly one company in this model. There's no "no company" state to
special-case in query code, which keeps every scoped query a plain
`where: { companyId }` rather than an `OR companyId IS NULL` escape
hatch.

## Migration & backfill (the part that must not disturb anything)

Hand-edited migration (not a blind `prisma migrate dev` diff), in this
order, so it's safe against the Railway deployment's existing
persistent-volume data, not just a fresh seed:

1. `CREATE TABLE Company (...)`.
2. `INSERT INTO Company (name, slug, createdAt) VALUES ('CodeWalnut', 'codewalnut', ...)`.
3. `ALTER TABLE User ADD COLUMN companyId INTEGER` (nullable at this
   step — SQLite can't add a `NOT NULL` column with no default onto a
   non-empty table in one step).
4. `UPDATE User SET companyId = (SELECT id FROM Company WHERE slug = 'codewalnut')`.
5. Prisma's SQLite table-rebuild strategy to make `companyId` `NOT NULL`
   with the FK constraint, now that every row has a value.

`prisma/seed.ts` / `prisma/demo-data.ts` also upsert the same
`CodeWalnut` company (by `slug`, matching the migration) before
creating any user, and every seeded user — both original demo accounts
and the realistic cohort — gets `companyId` set to it. Re-running the
seed against a fresh DB and against the already-migrated production
volume both converge on the same state.

## Scoped queries (what actually changed)

- `lib/roster.ts` — `buildRoster()` takes a `companyId` argument;
  `aggregateRoster()`'s pure function signature is unchanged (still
  takes a learner list — callers now pass an already-company-filtered
  list), so its existing unit tests need no changes.
- `app/admin/roster/page.tsx`, `app/admin/learners/page.tsx`,
  `app/admin/learners/[userId]/page.tsx` — resolve the current
  facilitator's `companyId` via `requireCurrentUser()` (now selects
  `companyId` too) and filter/guard by it. A learner id from another
  company 404s via the existing `notFound()` path in
  `[userId]/page.tsx`, the same way a non-learner id already does.
- `createUser` (`app/actions.ts`) — new users are created with the
  acting facilitator's own `companyId`, not left unset.
- `decideSubmission` (`app/actions.ts`) — `requireFacilitatorId()`
  became `requireFacilitator()` (returns `companyId` too); a facilitator
  can no longer decide a submission belonging to a learner outside their
  own company (`forbidden()`), the same defense-in-depth the roster
  query gets.
- `app/admin/users/page.tsx` — the user list is now scoped to the
  current facilitator's company.
- `lib/current-user.ts` — `requireCurrentUser()`'s `select` gains
  `companyId`.

## Company Dashboard (`/admin/company`, new)

A new pure aggregation function, `lib/company-stats.ts`
(`companyOverview(learners, submissions, competencies)` →
`{ learnerCount, overallPct, counts: StatusCounts, competencyProgress }`),
unit tested the same way `dashboard-stats.ts` and `roster.ts`'s
aggregation are — no Prisma dependency, synthetic multi-learner input.
The page itself composes it with the exact same chart components the
individual dashboard already renders (`ProgressRing`, `StatusDonut`,
`CompetencyBarChart`) — no new visual language, no new colors to
CVD-validate. Reachable via a new "Company Dashboard" link in
`AdminSidebar`, alongside Roster and Learner Dashboards.

## Acceptance criteria

- [x] `npm run build` clean, `npx vitest run` all passing including new
  `company-stats.test.ts`.
- [x] Fresh reseed produces exactly one `Company` row (`CodeWalnut`) and
  every seeded user has `companyId` set to it.
- [x] Before/after parity: Roster, `/dashboard` (learner), and
  `/admin/learners/:id` (reviewer) render byte-identical data
  pre- and post-migration — verified live via Playwright screenshot
  comparison, satisfying "existing functionality should not be
  disturbed."
- [x] `/admin/company` renders real aggregate numbers matching the sum
  of the individual learners' own dashboards (cross-checked against
  Roster's per-learner counts).
- [x] A learner id that doesn't belong to the acting facilitator's
  company 404s at `/admin/learners/:id` (can't be exercised with only
  one company seeded — verified by code inspection of the `where`
  clause, noted honestly rather than overclaimed, same discipline as
  chunk 5's role-check note).
