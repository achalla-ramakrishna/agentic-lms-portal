# Feature spec — Separate the learner and reviewer experiences

Written before implementation, per this repo's convention. Prompted by
the user logging in as a reviewer and finding learner and reviewer
functionality mixed together (they'd separately described the same
bug in a different tool — a design mockup, not this codebase — and
asked for the same essence applied for real here).

## The problem, confirmed against the real app

1. **No role-based routing.** `LoginForm.tsx`'s `callbackUrl` fallback
   was hardcoded to `/dashboard` for everyone — a facilitator logging
   in landed on their own (empty, meaningless) learner dashboard
   before ever reaching Roster.
2. **`AppSidebar` was shared, unconditionally, by both shells.** It
   always showed Dashboard/My Progress (learner-only) plus every
   competency with a personal progress count — meaningless for a
   reviewer, who doesn't do exercises. `app/admin/layout.tsx` rendered
   this exact same component.
3. **Ambient cross-links, not deliberate switching.** Every learner
   page showed a plain "Admin" link; the admin shell showed a plain
   "Learner view" link. Nothing marked these as a *mode switch* — they
   read as if both experiences were just one nav with pieces hidden.

## Goal

Two clearly separate shells — a reviewer never sees learner-only nav
or their own (irrelevant) personal progress by default, and a learner
never sees reviewer tooling. Where a reviewer legitimately wants to
preview the learner experience, that's a deliberate, labeled action
(the user's own suggestion — a dropdown), not incidental link leakage.

## Non-goals

- Storing "current view mode" as session/DB state. There's nothing to
  store — which shell you're in is just which URL you're on
  (`/admin/**` vs the rest). The switcher is navigation, not a
  preference.
- Hiding `/dashboard`, `/profile`, etc. from facilitator accounts at
  the route/middleware level. `proxy.ts` never restricted these by
  role and still doesn't — a facilitator previewing as learner needs
  to actually browse them. The fix is what the *nav* offers by
  default, not a new access restriction.
- Renaming the `Role` enum (`learner` | `facilitator`) — kept as the
  internal name throughout, matching every other reference in this
  codebase (schema, `requireFacilitatorId`, `/admin/users`'s role
  radio buttons). User-facing copy says "Reviewer" where that reads
  better (the switcher, the admin header), consistent with how the
  user refers to the role.

## Implementation

- `app/login/LoginForm.tsx` — after a successful `signIn`, fetches the
  fresh session and routes by `role`: facilitator → `/admin/roster`,
  learner → `/dashboard`. An explicit `callbackUrl` (set by `proxy.ts`
  when redirecting a logged-out deep link) always wins over the
  role default.
- `app/admin/AdminSidebar.tsx` (new) — facilitator-only nav: Roster,
  Users, Profile. No Dashboard/My Progress, no per-competency personal
  progress. Used only in `app/admin/layout.tsx`, replacing the shared
  `AppSidebar` there.
- `app/app-sidebar.tsx` — the facilitator-conditional Roster/Users
  block removed (moved to `AdminSidebar`); now purely the learner nav.
  Still rendered as-is when a facilitator deliberately switches to
  Learner view — that's intentional, it's the genuine learner
  experience, not a third hybrid one. Gained one facilitator-only
  element: a "← Back to Reviewer view" link at the very top, so
  there's always a guaranteed way back regardless of screen size
  (the header's switcher is `hidden` below `md:`, mobile-nav's usual
  pattern — this link lives inside the sidebar drawer instead, which
  is reachable on every breakpoint).
- `app/role-view-switcher.tsx` (new) — `RoleViewSwitcher`, a small
  `<select>` (`Reviewer view` / `Learner view`) that navigates to
  `/admin/roster` or `/dashboard` on change. Rendered only for
  facilitator accounts — a plain learner has no second role to switch
  into, so it never appears for them, and self-service privilege
  escalation was never on the table.
- `app/app-header.tsx` — the old conditional "Admin" link replaced
  with the switcher (`current="learner"`) plus a small "Previewing as
  learner" label, shown only to facilitator accounts.
- `app/admin/layout.tsx` — the old "Learner view" link replaced with
  the switcher (`current="reviewer"`, always visible, not hidden below
  `md:`, since this is the reviewer's primary shell); the logo now
  links to `/admin/roster` (previously not a link at all); title
  updated to "— Reviewer".
- `docs/SPEC.md` — the information-architecture route table now notes
  the role-based login routing and the two-shells convention.

## Acceptance criteria

- [x] A facilitator logging in lands on `/admin/roster`, not
  `/dashboard` — verified live (Playwright).
- [x] A learner logging in still lands on `/dashboard`, unaffected —
  verified live.
- [x] A learner account never renders `RoleViewSwitcher` or any
  reviewer-only link, on any page.
- [x] `AdminSidebar` never shows Dashboard/My Progress or a personal
  progress count.
- [x] Switching Reviewer → Learner → Reviewer via the dropdown works
  and round-trips correctly — verified live, both directions.
- [x] The "Back to Reviewer view" link is reachable from the mobile
  drawer, not just the desktop header — verified live at 375px.
- [x] `npm run build` clean, `npm test` 77/77, a fresh reseed, and
  live Playwright screenshots of both shells (desktop and mobile)
  reviewed before shipping.
