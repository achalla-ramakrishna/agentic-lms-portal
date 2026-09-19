# Feature spec — Chunk 4: Learner flow (Flow A, end-to-end)

Per Competency 02 (Spec Framing) — written before implementation. Covers
`docs/SPEC.md` §5 Flow A, steps 1–6 (steps 7–8, the facilitator side, are
chunk 5).

## Goal

A logged-in learner can: see a dashboard with overall progress and a
12-competency grid, open an exercise and see its own status against it,
click Start to begin, and submit evidence (a PR/branch link plus links
against the exercise's checklist, plus an optional note). None of this
requires a facilitator to exist yet — review is chunk 5.

## Non-goals (explicitly deferred)

- Facilitator review UI, decisions, notifications back to the learner —
  chunk 5. A learner can submit; nothing reviews it yet in this chunk.
- `/profile` (full history page) — chunk 6 per the build plan, dashboard
  covers "see my own progress" for this chunk.
- File uploads — out of v1 entirely (ADR 0002 Q3, link-only).
- Exercise gating/locking — open-by-default (ADR 0002 Q2), unchanged.
- "Continue where you left off" picking *the* single most relevant
  in-progress exercise when a learner has several: v1 picks the most
  recently started one. Smarter ranking is not this chunk's problem.

## User-facing behavior

1. `/dashboard` (new, session-protected): overall progress (passed+submitted
   out of 35, simple fraction — not weighted), a "Continue where you left
   off" card if any exercise is `in_progress`, and the 12-competency grid
   (fixed 01→12) each showing `x/y` exercises at `passed` status.
2. Competency detail (`/competencies/:number`, already exists) and exercise
   detail (`/competencies/:number/exercises/:exerciseNumber`, already
   exists) now show the current user's actual status per exercise instead
   of the static "Complete" placeholder chunk 2 shipped.
3. Exercise detail page: a "Start Exercise" button when status is
   `not_started`. Clicking it sets status `in_progress`, records
   `startedAt`, then re-renders the same page with the new status and a
   "Submit Evidence" link. No separate confirmation step — matches the
   wireframe's single-click Start.
4. "Submit Evidence" → `/submissions/new?exercise=<exerciseId>`: shows the
   exercise's evidence checklist, one URL input per checklist item
   (optional — nothing forces every item filled, matching `evidence_
   checklist`'s "an item stays unchecked until something is attached"
   language, not a hard validation gate), a PR/branch link field, and a
   notes textarea. Two submit buttons:
   - **Save Draft** — persists artifacts/link/note, status stays
     `in_progress`.
   - **Submit** — same persistence, status → `submitted`, `submittedAt`
     recorded.
5. `/submissions/:id` — read-only detail of one submission (own submission
   only in this chunk; a facilitator's cross-learner access is chunk 5).
   Shows status, evidence links by checklist label, PR link, note.
6. Re-visiting an exercise already `submitted`/`needs_rework`/`passed`
   shows that status instead of a Start button, with a link to the
   submission detail. `needs_rework` still allows re-submitting (edits the
   same submission row, per the one-submission-per-user-per-exercise
   unique constraint already in the schema).

## Data model

No schema changes — `Submission` and `EvidenceArtifact` already exist
(chunk 2). This chunk is entirely server actions + pages reading/writing
them.

## Implementation

- `lib/submissions.ts` — `getOrCreateSubmission(userId, exerciseId)` (uses
  the existing `@@unique([userId, exerciseId])`), status-transition
  helpers.
- `app/actions.ts` — `"use server"` actions: `startExercise(exerciseId)`,
  `saveSubmission(formData)` (draft or submit, decided by which button
  triggered it).
- Dashboard and submission pages added to `proxy.ts`'s matcher (session
  required, same as `/competencies/**`).
- A submission's evidence links are stored as one `EvidenceArtifact` row
  per non-empty checklist input; re-saving replaces them (delete + insert,
  same idempotent pattern as `ExerciseProject` in `prisma/seed.ts`) rather
  than trying to diff — simpler, and a submission is edited by one person
  at a time so there's no concurrent-edit case to preserve history for.

## Acceptance criteria

- [ ] `/dashboard` requires login (redirects like `/competencies` does).
- [ ] Dashboard's competency grid counts match what `/admin` will later
  show for the same user (verified by direct DB query in this chunk,
  since the roster UI doesn't exist until chunk 5).
- [ ] Starting an exercise flips its status and the button changes to
  "Submit Evidence" without a page reload surprise (standard Next.js
  server-action revalidation).
- [ ] Submitting evidence with a PR link + one checklist item creates
  exactly one `EvidenceArtifact` row and flips status to `submitted`.
- [ ] Saving a draft does not flip status.
- [ ] Visiting `/submissions/:id` for a submission that belongs to a
  different user is rejected (403 or not-found — not a silent leak of
  another learner's evidence).
- [ ] `npm run build` succeeds.
