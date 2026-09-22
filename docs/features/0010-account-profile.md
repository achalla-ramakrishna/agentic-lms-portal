# Feature spec — Account/Profile page (edit name, email, password)

Written before implementation, per this repo's convention. Prompted by
the user: "add profile to on top menu, where we can see user details,
they can change their password and edit the profile too."

## Naming collision with the existing "Profile"

The nav already had a "Profile" link — but that page (`/profile`) is
the exercise-history view, just renamed to "My Progress" earlier this
session (docs/features/0009-dashboard-snapshot.md) once it became
clear "Profile" didn't describe what it showed. That rename freed the
word "Profile" back up for what it conventionally means: account
settings. So this new page is `/account`, labeled **"Profile"** in the
nav — the URLs stay distinct even though the word moved.

## Goal

A signed-in user (any role) can see their name, email, and role, edit
their name/email, and change their password, from a page reachable off
the top nav (and the sidebar, for the same reason "My Progress" is in
both).

## Non-goals

- Self-signup or email verification — this app has neither (ADR 0002
  Q4/Q6, no email integration); editing your own email here is a
  direct update, same trust level as `createUser` setting one.
- Avatars/profile pictures — not asked for.
- A "member since" date — the `User` model has no `createdAt`; not
  adding a migration for one cosmetic field outside what was asked.
- Admin editing another user's profile — this page only ever acts on
  the signed-in user's own row (`requireUserId()` from the session,
  never a client-supplied user id), by design.

## Data model

No schema changes — `User.name`/`email`/`passwordHash` already exist.

## The JWT staleness problem

`lib/auth.ts` uses NextAuth's `"jwt"` session strategy: `session.user`
is a snapshot taken at login. Editing name/email here updates the
`User` row but not that token, so anywhere the current name/email is
*displayed* (not just used as an id) would show stale data until the
next login — worst case, the header greeting still shows your old name
right after you changed it.

Fixed with `lib/current-user.ts`'s `requireCurrentUser()` — re-reads
the user fresh from the DB via `session.user.id` — used everywhere the
name/email is actually shown: `app-header.tsx`, `admin/layout.tsx`,
`dashboard/page.tsx`'s greeting, `profile/page.tsx`'s heading. Chose
this over a client-side `next-auth/react` `update()` + `useTransition`
flow (which would need a new pattern this codebase doesn't otherwise
use — every other form here is a plain `<form action={serverAction}>`
+ `redirect()`) since a small extra query per page is simpler and
keeps every mutating action consistent with `app/actions.ts`'s
existing style.

## Implementation

- `lib/current-user.ts` (new) — `requireCurrentUser()`.
- `app/actions.ts` — `updateProfile` (name + email, checks email
  uniqueness excluding the caller's own row) and `changePassword`
  (requires the *current* password, not just an active session, so a
  left-open session can't be used to lock the real owner out). Both
  follow the existing `redirect("/account?error=...")` /
  `redirect("/account?success=1")` pattern from `createUser`.
- `app/(app)/account/page.tsx` (new) — account details card (name/
  email form + read-only role badge) and a change-password card.
- `app/app-header.tsx`, `app/app-sidebar.tsx`, `app/admin/layout.tsx`
  — "Profile" link added to nav (header + sidebar + the separate admin
  shell), alongside the freshness fix above.

## Acceptance criteria

- [x] "Profile" appears in the top nav (and sidebar) for every signed-
  in user, linking to `/account`, distinct from "My Progress".
- [x] Editing name/email updates the DB and shows up immediately
  everywhere it's displayed — verified live (Playwright): edited a
  name, the dashboard greeting reflected it on the very next
  navigation, no re-login needed.
- [x] Changing password requires the current password; the new
  password actually authenticates — verified live: changed a
  password, logged out, logged back in with only the new one.
- [x] `npm run build` clean, `npm test` passing, a fresh reseed
  succeeds, and live Playwright screenshots reviewed before shipping.
