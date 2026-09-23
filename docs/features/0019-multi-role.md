# Feature spec — One account, multiple roles, and a view switcher

Written before implementation, per this repo's convention. Prompted by
the user, after `0018-role-separation.md`'s clean split landed: "if
company admin is a reviewer, then a dropdown we can toggle as company
admin, reviewer, learner and see respectively." Confirmed via
AskUserQuestion that this should be real multi-role support (a second
role genuinely granted to the account), not a UI-only preview of what
another role's screens look like.

## Goal

An account can hold more than one role at once — e.g. a
`company_admin` who is also a `facilitator` — and gets the *union* of
every role it holds' capabilities, simultaneously, all the time. A
labeled switcher lets it jump between the sections its role set
grants; switching is pure navigation, not a privilege change, since
every one of those permissions was already active before and after
the click.

## Non-goals

- Storing "which view am I currently in" as session or DB state.
  There's nothing to store — the switcher just derives its current
  option from the URL (`usePathname()`) and navigates on change, same
  as `0013-role-separation.md`'s original "deliberate switch, not
  ambient link" insight, and the same on-change-navigate pattern as
  `LearnerPicker`/`CompanySwitcher`.
- Role-scoped JWT refresh. `session.user.roles` is snapshotted at
  login (`lib/auth.ts`'s `authorize()`); granting an extra role to an
  already-logged-in account only takes effect on their *next* login —
  the same tradeoff already accepted for name/email elsewhere in this
  codebase.
- More than three roles in one account, or a UI for granting extra
  roles beyond what's seeded — `Users` still only sets the *primary*
  `role`; extra roles are seed-only for now.

## Data model

```
model UserRole {
  id     Int  @id @default(autoincrement())
  userId Int
  user   User @relation(fields: [userId], references: [id])
  role   Role
  @@unique([userId, role])
}

model User {
  ...
  role       Role       @default(learner) // primary — default landing page, headline role in Users
  extraRoles UserRole[] // additional roles this account also holds
}
```

`role` stays "the" primary role — used for the account's default
post-login landing page and its headline label in the Users table.
Every permission check instead uses a computed `roles: Role[]`
(primary + `extraRoles`, deduped), so nothing downstream cares which
role is "primary" versus "extra" — they're all equally real.

## Implementation

- `lib/current-user.ts` (`requireCurrentUser`) and `lib/auth.ts`
  (`authorize()`) both compute the same `roles: Role[]` — one at
  request time from the DB, one at login time into the JWT — from
  `[user.role, ...extraRoles.map(r => r.role)]`, deduped.
- `types/next-auth.d.ts` — `roles: Role[]` added to `Session.user`,
  `User`, and `JWT` alongside the existing singular `role`.
- Every gate this touches (`app/admin/layout.tsx`,
  `app/admin/roster/page.tsx`, `app/admin/users/page.tsx`, etc.,
  `app/actions.ts`'s `requireReviewer`/`requireCompanyManager`) checks
  `roles.includes(...)` — array membership — not the singular `role`.
  `lib/company-scope.ts`'s `resolveEffectiveCompany` does the same for
  its `super_admin` override, so an account holding `super_admin` as
  an *extra* role (not primary) still gets `CompanySwitcher` honored.
- `app/role-view-switcher.tsx` (`RoleViewSwitcher`) — a `<select>`
  offering only the views this account's actual `roles` grant (never
  shown at all to a plain single-role account). Its current option is
  derived from `usePathname()` against each option's target path, not
  a value passed down from the server — a hardcoded/guessed `current`
  can desync from the real page and silently swallow the next
  `onChange` (React sees no value change). Rendered in `AppHeader`
  (learner-shell pages) and `app/admin/layout.tsx` (admin-shell
  pages), so it's reachable from either side.
- `app/app-sidebar.tsx` — the learner shell's "back to reviewer/admin"
  link is derived from `session.user.roles`, not the singular role.
- A demo account exercises this for real: `dual.role@example.com` —
  primary role `company_admin`, extra role `facilitator`
  (`prisma/seed.ts`).

## Acceptance criteria

- [x] `dual.role@example.com` reaches both Users/Settings
      (company_admin) and Roster/Company Dashboard/Learner Dashboards
      (facilitator) — no 403 on either side.
- [x] `RoleViewSwitcher` lists exactly the views this account's role
      set grants, and selecting one actually navigates there.
- [x] A single-role account (e.g. a plain `facilitator`) never sees
      the switcher.
- [x] Granting `dual.role@example.com`'s roles happens without
      touching the `role` column read by "Users" table display or
      login-landing logic.
