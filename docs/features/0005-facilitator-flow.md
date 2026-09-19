# Feature spec — Chunk 5: Facilitator flow (Flow B, end-to-end)

Per Competency 02 (Spec Framing) — written before implementation. Covers
`docs/SPEC.md` §5 Flow B.

## Goal

A facilitator can see every learner's progress at a glance, drill into a
single submission, and record a Passed / Needs Rework decision with an
optional comment — which the learner then sees on their own exercise page
(already wired in chunk 4's `needs_rework` facilitator-feedback panel).

## Non-goals (explicitly deferred)

- Cohorts, "quiet for 7+ days" signal — Phase 2 (ADR 0002 Q6 already
  defers this).
- Notifications (email/Slack) on decision — Phase 2 per `docs/SPEC.md` §9.
  The learner sees the decision by visiting the portal, not by being
  pinged.
- Sorting/filtering the roster beyond "pending submissions first" — no
  cohort grouping yet, so there's nothing else meaningful to filter by.

## User-facing behavior

1. `/admin/roster` (facilitator-only, already gated by `app/admin/layout.tsx`):
   a table of every learner × 12 competencies, each cell showing
   `passed/total` for that competency, plus an overall column. Rows with
   at least one `submitted` (pending review) submission sort first.
   A "Pending Review" list below the table links each pending submission
   straight to its detail.
2. Clicking a submission (from the roster or the pending list) opens
   `/submissions/:id` — the **same page a learner sees for their own
   submission** (chunk 4), not a separate duplicated view: a facilitator
   viewing someone else's submission already renders it (the owner-or-
   facilitator guard from chunk 4), so this chunk only adds a decision
   control to that page, visible when the viewer is a facilitator.
   `/admin/submissions/:id` (named in the original IA) is a redirect to
   `/submissions/:id` rather than a duplicate template — same content, one
   source of truth, per AGENTS.md's anti-duplication convention.
3. Decision control (facilitator view only): radio Passed / Needs Rework +
   optional comment textarea + "Submit Decision" button. On submit:
   `status` → `passed` or `needs_rework`, `decidedAt` and `decidedById`
   set, `facilitatorComment` saved. Redirects back to the roster.
4. A learner whose submission was marked `needs_rework` sees the comment
   on their exercise page (chunk 4 already renders
   `submission.facilitatorComment` there) and can resubmit via the
   existing `/submissions/new` flow (already handles `needs_rework` as a
   resubmit case).

## Data model

No schema changes — `decidedAt`, `decidedById`, `facilitatorComment`
already exist (chunk 2).

## Implementation

- `lib/roster.ts` — one query building the learner × competency grid
  (reuses the same "passed count per competency" shape as
  `app/dashboard/page.tsx`, generalized across all learners instead of
  one).
- `app/actions.ts` — add `decideSubmission(formData)`: validates the
  caller is a facilitator (defense in depth — the page already gates on
  role, but a server action must not trust that its caller only ever came
  from a page that checked).
- `app/admin/roster/page.tsx` — the table + pending list.
- `app/submissions/[id]/page.tsx` (chunk 4, edited not replaced) — adds
  the decision form when `session.user.role === "facilitator"`.
- `app/admin/submissions/[id]/page.tsx` — thin redirect to
  `/submissions/:id`.

## Acceptance criteria

- [ ] `/admin/roster` is facilitator-only (learner gets the same 403 as
  `/admin` already does).
- [ ] Roster's per-competency counts for a given learner match that
  learner's own `/dashboard` counts exactly (cross-checked, not just
  visually similar).
- [ ] A submission with status `submitted` appears in the roster's
  Pending Review list; one with `passed`/`needs_rework`/`in_progress`
  does not.
- [ ] Submitting a decision updates `status`, `decidedAt`, `decidedById`,
  `facilitatorComment` in the DB (verified directly, not just via page
  content) and the roster's pending list no longer contains it.
- [ ] A learner posting directly to the `decideSubmission` action (bypassing
  the UI) is rejected — role is re-checked server-side, not just hidden
  in the UI.
- [ ] `needs_rework` with a comment is visible on the learner's own
  exercise page (regression check against chunk 4 behavior).
- [ ] `npm run build` succeeds.
