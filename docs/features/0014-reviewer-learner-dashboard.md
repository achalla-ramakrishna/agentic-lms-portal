# Feature spec — A reviewer-facing dashboard per learner

Prompted directly: "learner view has a dashboard. in the reviewer login,
can we have a dashboard, where we can select a user in the drop down and
see that learners dashboard."

## The gap

`RoleViewSwitcher`'s "Learner view" (0013) lets a facilitator preview the
learner shell, but it only ever shows *their own* dashboard — a
facilitator has no submissions, so that's an empty, meaningless screen.
There was no way for a reviewer to see a specific learner's real progress
snapshot without going learner-by-learner through Roster's raw numbers.

## Goal

A facilitator-only page where picking a learner from a dropdown renders
that learner's actual dashboard — the same progress ring, status donut,
competency bar chart, stat tiles, and competency grid the learner sees
themselves — not a re-derived or simplified version of it.

## Non-goals

- A separate visual design for the reviewer's version of the dashboard.
  Reusing the exact same charts/components, just with reviewer-appropriate
  framing text ("{name}'s Dashboard" instead of "Welcome back"), is the
  point — two implementations of the same chart would drift out of sync.
- Editing/annotating from this view. It's read-only, matching Roster's own
  read-only table; feedback still happens on the submission review pages.

## Implementation

- `app/(app)/dashboard/LearnerDashboardView.tsx` (new) — the entire body
  of the old `dashboard/page.tsx` (data fetching + charts + competency
  grid), extracted into an async component parameterized by
  `{ userId, heading, subheading }` instead of calling
  `requireCurrentUser()` internally. This is the single source of truth
  for "what a learner's dashboard looks like" — both call sites below
  render it unchanged.
- `app/(app)/dashboard/page.tsx` — reduced to: resolve the current user,
  render `<LearnerDashboardView userId={user.id} heading="Welcome back,
  {name}" .../>`. Behavior is identical to before the refactor — verified
  by comparing a learner's own `/dashboard` screenshot against the
  reviewer's view of the same learner (`/admin/learners/{id}`): same
  percentages, same counts, same chart segments.
- `app/admin/learners/[userId]/page.tsx` (new) — facilitator-only (guarded
  by `app/admin/layout.tsx`'s existing role check, same as every other
  `/admin/**` page). Looks up the learner by id (404s via `notFound()` if
  the id isn't a real `learner`-role user), renders `LearnerPicker` plus
  `LearnerDashboardView` with reviewer framing ("{name}'s Dashboard" /
  "Progress snapshot, as seen by the reviewer.").
- `app/admin/learners/page.tsx` (new) — the nav entry's target. Redirects
  to the alphabetically-first learner rather than showing an empty
  picker-only page, so the link is always immediately useful. Shows "No
  learners yet." only if the roster is genuinely empty.
- `app/admin/learners/LearnerPicker.tsx` (new) — client component,
  `<select>` of all learners (alphabetical), navigates via
  `router.push` on change — same on-change-navigate pattern as
  `RoleViewSwitcher` (0013), not a form submit.
- `app/admin/AdminSidebar.tsx` — added a "Learner Dashboards" link,
  between Roster and Users.
- `app/admin/roster/page.tsx` — learner names in the Roster table are now
  links to `/admin/learners/{userId}`, so a reviewer scanning the table
  can jump straight into a learner's full dashboard instead of only
  seeing the raw per-competency counts.

## Acceptance criteria

- [x] `npm run build` clean, all routes (`/admin/learners`,
  `/admin/learners/[userId]`) compile as dynamic server routes.
- [x] `npx vitest run` — 77/77 (unchanged; this feature has no new pure
  logic to unit test, it's a data-fetch + render composition).
- [x] Fresh reseed + live Playwright verification, logged in as the
  reviewer (Jordan Blake): Roster → click a learner name → lands on
  `/admin/learners/{id}` with that learner's real dashboard. Switching
  via the dropdown navigates to the newly selected learner's dashboard.
  `/admin/learners` index redirects to the first learner.
- [x] Verified at both 1440px and 375px — dropdown, charts, and
  competency grid all render correctly on mobile.
- [x] A learner's own `/dashboard` (post-refactor) renders pixel-identical
  data to the reviewer's view of that same learner — confirms the
  extraction didn't change behavior.
