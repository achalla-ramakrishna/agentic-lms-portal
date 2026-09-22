# Feature spec — Dashboard snapshot + Profile rename

Written before implementation, per this repo's convention. Prompted by
the user prepping for a 400-customer demo: "Profile" doesn't say what
that page actually is (an exercise history), and the Dashboard should
give an at-a-glance snapshot of how the learner is doing — charts,
color, encouragement.

## Goal

- Rename the "Profile" nav label (header + sidebar) to something that
  actually describes the page it opens.
- Rebuild the Dashboard into a real snapshot: overall completion, a
  status breakdown, a few honest KPIs, and an encouraging message —
  using real data only, no fabricated metrics.

## Non-goals

- Renaming the `/profile` route itself — only the visible nav label
  and page heading changed, to avoid touching every link into that
  route for a naming preference.
- Cross-user comparisons ("you're ahead of X% of learners") — with a
  small/local seed of demo accounts this reads as broken or arbitrary;
  skipped rather than fabricated. Worth revisiting once there's a real
  cohort.
- A login-day streak — this app doesn't track login events, only
  submission timestamps, so a "streak" would be invented. Used
  `daysSince(firstStarted)` ("Day N of your journey") instead, which
  is real, always-available data.
- A charting library dependency — none existed in package.json; every
  chart here is plain SVG/CSS (dataviz skill's own recommendation:
  "build each in plain HTML"), consistent with this app's existing
  `app/connector-lines.tsx` SVG pattern.

## Naming

"Profile" → **"My Progress"** in `app/app-header.tsx` and
`app/app-sidebar.tsx`. The page's own `<h1>` updated from "{name}'s
history" to "{name}'s progress" to match.

## Data model

No schema changes. Everything derives from existing
`Submission`/`EvidenceArtifact` rows:

- Overall % — `passedCount / totalExercises` (already computed).
- Status breakdown — every exercise bucketed into one of the 5
  `SubmissionStatus` values (`lib/dashboard-stats.ts`'s
  `statusBreakdown`), treating both "no submission row" and an
  explicit `not_started` row as not-started (both are possible per
  `getOrCreateSubmission`'s upsert).
- Evidence submitted — `EvidenceArtifact` count for the user's
  submissions.
- Competencies completed — every exercise in that competency is
  `passed`.
- "Day N of your journey" — `daysSince()` from the earliest
  `Submission.startedAt` to now, +1.

## Implementation

- `lib/dashboard-stats.ts` (new) — pure functions (`statusBreakdown`,
  `progressMessage`, `daysSince`), no Prisma, directly unit-tested
  (`__tests__/dashboard-stats.test.ts`), same pattern as
  `lib/status.ts`/`lib/roster.ts`.
- `lib/submissions.ts` — added `STATUS_FILL_CLASS`, a solid-fill
  variant of the existing `STATUS_BADGE_CLASS` hue mapping (ADR 0003)
  for chart segments rather than tinted pills. Same status→color
  everywhere, one source of truth.
- `app/(app)/dashboard/ProgressRing.tsx` (new) — the dashboard's one
  hero figure: an SVG ring meter for overall %, fill/track at full and
  low opacity of the same hue (success-fg), no client JS needed.
- `app/(app)/dashboard/StatusBar.tsx` (new) — a stacked bar + legend
  across all exercises by status. Validated the existing status hexes
  against the dataviz skill's palette checks in this component's real
  render order: CVD separation passes; a "lightness band" flag on
  these pre-existing, ADR-documented, everywhere-else-shipped hexes
  wasn't acted on (see the file's own comment) — redesigning this
  app's whole status palette is out of scope for one dashboard chart.
- `app/(app)/dashboard/CompetencyGrid.tsx` — added a thin per-card
  meter bar (same-hue track+fill as the ring) under each competency's
  "X/Y passed" line.
- `app/(app)/dashboard/page.tsx` — rebuilt around the ring, an
  encouragement callout (reusing the tagline-callout visual pattern
  from `CompetencyTabs.tsx`), a 4-tile KPI row, the status bar, and
  the existing "continue where you left off" card and competency
  grid, kept as-is.
- `app/(app)/profile/page.tsx` — heading text only.

## Acceptance criteria

- [x] Nav (header + sidebar) reads "My Progress", not "Profile".
- [x] Dashboard shows one hero ring (overall %), a real encouragement
  message, 4 KPI tiles, and a status-breakdown bar with legend — all
  from real per-user data, nothing fabricated.
- [x] Per-competency cards show a thin progress meter matching each
  competency's own color.
- [x] `npm run build` clean, `npm test` passing (77/77, +9 new), a
  fresh reseed succeeds, and live Playwright screenshots of both pages
  (with synthetic dev-only progress data to verify a populated state)
  reviewed before shipping.
