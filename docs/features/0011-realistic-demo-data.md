# Feature spec — Realistic demo data for customer/conference presentations

Written before implementation, per this repo's convention. Prompted by
the user: "can you setup some demo data of few users with reviewer
update etc... this demo data will be very useful for giving a
presentation to customers in the conference. this demo data should be
realistic instead of demo user 1, demo user 2 etc."

## Goal

A roster/dashboard screenshot (or live click-through) shows real
variety — multiple realistically-named learners at different progress
levels, and a reviewer who has actually decided some submissions with
a real comment — instead of the two bare `learner@example.com` /
`facilitator@example.com` accounts, which have no progress at all.

## Non-goals

- Replacing the original two demo accounts — kept as-is (README
  already documents them, `lib/artifact-templates.ts` references
  `learner@example.com` in a toolkit example). This is additive.
- Real names of real people — every name here is a plausible but
  invented full name; emails stay on `@example.com` (RFC 2606,
  reserved for documentation/testing), same domain the existing demo
  accounts already use.
- A different password per learner — one shared password
  (`Conference2026!`) across the whole new cohort, since a live
  conference demo needs the presenter to switch accounts fast, not
  look up five different passwords.
- Automating this from `content/seed.json`/`scripts/generate-seed.mjs`
  — those own real guidebook content, not synthetic user/submission
  data; this is a separate, clearly-labeled synthetic dataset.

## Data model

No schema changes — `User`, `Submission`, `EvidenceArtifact` already
support everything needed (status, `startedAt`/`submittedAt`/
`decidedAt`, `decidedById`, `facilitatorComment`, `prLink`,
`learnerNote`, evidence artifacts matching each exercise's real
`evidenceChecklist`).

## The cohort

5 learners at different points, chosen to cover the interesting roster
states, not just "more progress = better":

- **Priya Natarajan** — brand new (1 passed, 1 in progress).
- **Diego Fernandez** — mid-progress, includes a `needs_rework` with a
  real, specific reviewer comment (the rework flow needs something to
  show).
- **Liam Carter** — mid-progress with 3 `submitted` exercises still
  awaiting decision (the reviewer's pending-queue scenario).
- **Amara Okafor** — advanced (6 competencies fully passed), 1
  `submitted` pending.
- **Yuki Tanaka** — near-complete (9 competencies passed, 77%
  overall) — the "success story" account.

Plus **Jordan Blake**, a facilitator who is the `decidedById` on every
decided submission across the cohort, with real facilitator comments
on the rework case and two of the passed ones (not all — real
reviewers don't comment on every quick approval).

## Implementation

- `prisma/demo-data.ts` (new) — `seedDemoData(prisma)`: upserts the 6
  users, then for each learner's progress plan, upserts the matching
  `Submission` (looked up by real competency/exercise number, not a
  hardcoded id) and, for anything at `submitted` or later, generates
  real `EvidenceArtifact` rows from that exercise's actual
  `evidenceChecklist` (not fabricated labels) plus a plausible PR link
  built from the exercise's real project repo name. Idempotent
  (upsert-by-email / upsert-by-`userId_exerciseId`), so re-running it
  never duplicates rows — same discipline as the rest of
  `prisma/seed.ts`.
- `prisma/seed.ts` — calls `seedDemoData(prisma)` at the end of
  `main()`, so it runs on every `npm run db:seed` — including on
  Railway, since `railway.json`'s `startCommand` already runs
  `db:seed` on every deploy.
- `README.md` — documents the new cohort's shared password, same
  table style as the existing two demo accounts.

## Acceptance criteria

- [x] Fresh reseed creates 6 new users (1 facilitator, 5 learners)
  with real names, without touching the original 2 demo accounts.
- [x] The roster page shows a real spread: different overall %,
  different pending-review counts, and at least one `needs_rework`
  row with a comment — verified live via Playwright as the reviewer
  account.
- [x] Evidence artifacts exist for every submitted/passed/needs_rework
  submission, matching that exercise's real checklist labels (not
  fabricated ones) — verified via direct query (63 submissions, 319
  evidence artifacts after a fresh reseed).
- [x] `npm run build` clean, `npm test` passing (type-checked
  `prisma/demo-data.ts` directly since seed scripts aren't part of the
  Next build), a fresh reseed succeeds, and a live Playwright
  screenshot of the roster reviewed before shipping.
