# Feature spec — Chunk 6: Polish

Per Competency 02 (Spec Framing) — written before implementation. Closes
out the v1 MVP build plan in `docs/SPEC.md` §7.

## Goal

Three things, each independently small: a `/profile` page (the IA item
never built), empty/error states that don't crash or look broken, and a
real test suite covering the logic that's actually worth pinning down
(status transitions, roster aggregation, seed parsing) — deferred from
chunk 1 specifically to avoid installing an unused, eventually-stale test
runner (see `AGENTS.md` Commands).

## Non-goals

- No new user-facing features — this chunk touches existing flows only to
  make them not break at their edges.
- Not chasing 100% coverage. Business logic that was worth pulling out of
  a page/action into a pure, testable function gets a test; page
  rendering doesn't.

## Scope

### 1. `/profile`

Full per-exercise history across all 12 competencies (fixed 01→12,
01→04), one compact list per competency — same status vocabulary as the
dashboard/roster (`lib/submissions.ts`'s `STATUS_LABEL`), no new data
model.

### 2. Empty/error states

- `app/not-found.tsx` — branded 404 instead of the Next.js default, for
  any URL that doesn't match a route.
- `app/error.tsx` — a client error boundary so an unexpected server
  component error doesn't show a raw stack trace to a learner.
- Exercise detail / submission panel: an exercise with an empty evidence
  checklist (parser fallback edge case) shows "No evidence items listed
  for this exercise" instead of silently rendering nothing, so it reads
  as intentional, not broken.

### 3. Tests

Three pure-logic extractions, each testable without a DB or a browser:

- `scripts/lib/parse-readme.mjs` — the section/bullet/numbered-line
  parsing already in `scripts/generate-seed.mjs`, pulled out so it can be
  imported by both the generator and its test, covering the ordinary
  bulleted case and the prose-paragraph fallback (exercises 3.1–3.3,
  7.1–7.4 — see chunk 2's commit).
- `lib/status.ts` — pure status-transition rules (`canStart`,
  `canSubmitEvidence`, decision → next status), extracted out of
  `app/actions.ts` so the rules are testable independent of Prisma/
  Next.js request context. `app/actions.ts` calls these instead of
  re-deriving the logic inline.
- `lib/roster.ts` — split `buildRoster()` (Prisma I/O) from a new pure
  `aggregateRoster(learners, competencies, submissions)` (the actual
  grid/percentage math), so the aggregation itself has a test independent
  of a seeded DB.

Test runner: whichever `vitest` version has no unresolved high/critical
`npm audit` finding in its own dependency tree at install time (checked
fresh, not assumed from chunk 1's memory of an older version) — same bar
as every other dependency choice in this repo (ADR 0001).

## Acceptance criteria

- [ ] `/profile` requires login and shows all 35 exercises' current
  status, grouped by competency in fixed order.
- [ ] Visiting an unmatched URL while logged in shows the branded 404,
  not Next's default.
- [ ] `npm test` runs and passes; covers at minimum: the prose-paragraph
  evidence/criteria fallback parser case, at least one status-transition
  rule per role (learner start/submit, facilitator decide), and roster
  aggregation producing correct `passed/total` for a synthetic multi-
  learner, multi-competency input.
- [ ] `npm audit` on the final `package.json` has no new unresolved
  finding beyond the one already documented in ADR 0001.
- [ ] `npm run build` succeeds.
