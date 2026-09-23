# Feature spec — Separate company_admin and facilitator, add super_admin

Written before implementation, per this repo's convention. Prompted by
the user reviewing the live admin roster and asking: "can we have
company_admin, reviewer features separated. We can have a super_admin
who can see everything."

## The problem, confirmed against the real app

`docs/features/0015-companies-roles.md` added `company_admin` and
`super_admin` to the `Role` enum but deliberately did nothing else with
them (its own non-goals said so). In practice every `/admin/**` page's
gate was still just "any facilitator-or-above," so a `company_admin`
account could review and decide submissions — not their job — and a
`facilitator` could edit company branding or add/remove users — also
not their job. Nothing kept the two roles' capabilities apart.

## Goal

A clean split, with no overlap unless the same account genuinely holds
both roles (that's `0019-multi-role.md`, not this one):

- **`facilitator`** — the review side. Roster (review/decide
  submissions), Company Dashboard, individual Learner Dashboards. Own
  company only.
- **`company_admin`** — the management side. Users (add/edit
  learners, facilitators, other company_admins), Company Settings
  (name/logo/accent color branding). Own company only.
- **`super_admin`** — both, and across *every* company, not just one.
  No company boundary at all: reviews submissions anywhere, manages
  users and settings anywhere, and is the one role
  `resolveEffectiveCompany` (`lib/company-scope.ts`) will actually
  honor a `?companyId=` override for.

## Non-goals

- Multi-role accounts. This spec assumes one account, one primary
  role, and asks "does *this* role, alone, get to do *this*." Whether
  an account can hold several roles at once (and how it switches
  between the views that grants) is `0019-multi-role.md`.
- Any new UI chrome for the split itself — `AdminSidebar` already
  existed (`0013-role-separation.md`); this pass changes what it's
  allowed to link to per role, not its shape.
- Changing what a `learner` can do. Untouched.

## Implementation

- `app/admin/roster/page.tsx`, `app/admin/company/page.tsx`,
  `app/admin/learners/page.tsx`, `app/admin/learners/[userId]/page.tsx`
  — gated to `facilitator`/`super_admin` only. A `company_admin`
  hitting any of these gets the same 403 a `learner` always did.
- `app/admin/users/page.tsx`, `app/admin/settings/page.tsx` — gated to
  `company_admin`/`super_admin` only. A `facilitator` hitting either
  gets a 403.
- `app/actions.ts` — `requireReviewer()` backs the review-side
  actions (`decideSubmission`), `requireCompanyManager()` backs the
  management-side actions (`createUser`, `updateCompanyBranding`).
  Named for the job, not the role, since a multi-role account can
  satisfy either without being *only* that role.
- `AdminSidebar` only links to the pages the current account's role(s)
  actually pass the gate for — no dead links to a page that will just
  403.
- `super_admin`'s cross-company reach: every scoped query already goes
  through `resolveEffectiveCompany`
  (`0015-companies-roles.md`); this pass is what makes that function's
  `super_admin`-only override branch actually reachable by a real
  role, via `CompanySwitcher`'s `?companyId=` param.

## Acceptance criteria

- [x] A `company_admin` account gets a 403 on Roster, Company
      Dashboard, and Learner Dashboards; still reaches Users and
      Settings.
- [x] A `facilitator` account gets a 403 on Users and Settings; still
      reaches Roster, Company Dashboard, and Learner Dashboards.
- [x] A `super_admin` account reaches all of the above, for any
      company, via `CompanySwitcher`.
- [x] `AdminSidebar` never links a role to a page it will 403 on.
