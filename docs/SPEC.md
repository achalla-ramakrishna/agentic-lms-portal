# SPEC — Agentic LMS Portal

Source: `LMS Portal for Agentic Engineering — Product Spec & Wireframes`
(2026-09-19). This file is the working spec + build plan; open questions
from the original doc are resolved in `docs/adr/0002-v1-scope-decisions.md`
rather than left open here.

## 1. Goals & Scope

CodeWalnut's guidebook defines 12 competencies. The
`agentic-engineering-full-exercises-set` repo turns them into 35 verifiable,
evidence-graded challenges with real starter apps, hidden test suites, and
adversarial scenarios. Today this lives as a PDF plus a folder of git repos
— powerful content with no delivery mechanism.

**What this portal is for**: give engineers a guided path through the 12
competencies, a way to pick up an exercise and know exactly what "done"
looks like, and a way for a facilitator to see who has done what without
reading 35 folders of evidence by hand.

**In scope for v1**
- Learner browses competencies, reads "The Shift" concept content, sees
  exercises under each one.
- Learner opens an exercise, reads mission/evidence/completion-criteria,
  marks progress (not started / in progress / submitted / needs rework /
  passed).
- Learner attaches evidence as **links** (PR/branch link, plus optional
  pasted notes) to a submission — no file upload in v1 (§10.3 resolved:
  link-only).
- Facilitator sees a roster (every learner × every competency), drills into
  a single submission.
- Manual completion tracking works end-to-end with zero CI integration.

**Explicitly out of scope for v1** (see §9 Roadmap for later phases)
- Automatically running `npm run verify:exercise` against a learner's fork.
- Auto-grading beyond submitted / passed / needs-rework.
- Multi-tenant / multi-organization support.
- In-app authoring UI for competencies/exercises (seeded from the repo).
- Cohorts, gated exercise progression, file-upload evidence storage.

## 2. Roles

Single `role` enum on `user`: `learner | facilitator`. No separate tables —
promoting someone to facilitator is a one-field update.

**Learner**: browses competencies/exercises, works exercises locally in
their own clone of the exercise-set repo, logs progress and evidence links
in the portal, sees own progress per competency and overall.

**Facilitator**: sees the roster with per-competency status and overall %,
opens a submission to review evidence against that exercise's checklist,
marks Passed / Needs Rework with an optional comment.

## 3. Content Model

Mirrors the source hierarchy exactly:

- **Competency** (12, seeded): number (1–12, fixed sort key), title,
  subtitle, "The Shift" narrative, mastery bullets, common mistake,
  toolkit tags.
- **Exercise** (35, seeded): competency FK, number (1–4, fixed sort key
  within competency), slug (matches repo folder name), title, mission,
  duration label, how-to steps, evidence checklist, completion criteria.
- **ExerciseProject** (35+, seeded): most exercises have one; a few (4.3,
  11.3) ship two starter apps.

Seeded once via `npm run db:seed`, idempotent (upsert by slug — §10.5
resolved: safe to re-run). Seed data lives in `content/seed.json`, itself
generated from the exercise-set repo's root `README.md` index table plus
each exercise's own `README.md` (see `scripts/generate-seed.mjs`, chunk 2).

### 3a. Full exercise coverage (all 35)

- **01 Toolchain Setup** — 01 Agent Onboarding Kit · 02 Agent Guardrails
- **02 Spec Framing** — 01 Spec Driven Feature Development · 02 Superpowers
  Feature Implementation
- **03 Context Engineering** — 01 Session Handover from Claude to Codex ·
  02 Generate AGENTS.md for a Brownfield Repository · 03 Create Queryable
  Repo Context for Agents
- **04 Test Automation** — 01 Playwright MCP Checkout Rescue · 02 TDD Skill
  Network Boundary Rescue · 03 Verification Skill Workflow Gate
- **05 Skill Packaging** — 01 Progressive Disclosure Release Skill · 02
  Skill Trigger Boundary Evals · 03 Skill Benchmark and Package Gate
- **06 Multi-Agent Workflows** — 01 Parallel Worktree Conflict Rescue · 02
  Specialist Review Merge Gate · 03 Agent Kanban Collision Control
- **07 Docs & Diagrams** — 01 Reverse Engineer a Sequence Diagram · 02
  Generate a Design Document from Code · 03 Payment Module Visualization ·
  04 Extract a Domain Model from the Entire Repository
- **08 Evidence-led PRs** — 01 Failure-Preserving PR Evidence Pack · 02
  Feature Flag Kill-Switch Proof · 03 Performance and Accessibility Release
  Gate
- **09 Code Review** — 01 Security and Accessibility Review Gauntlet · 02
  Independent Diff Triage · 03 Code Review Regression Gate
- **10 Token Economics** — 01 Progressive Context Budget Refactor · 02
  Risk-Based Model Routing Cost Gate · 03 Minimal-Diff Scope Budget
- **11 Agentic Refactoring** — 01 Characterization-First Rules Refactor ·
  02 Strangler Checkout Route · 03 Contract-Safe Full-Stack Rules
  Extraction
- **12 Agentic Retrospective** — 01 Trace-Measured Session Waste Reduction
  · 02 Repeated Mistake to Repository Rule · 03 Trace-Backed Workflow
  Optimizer

2+2+3+3+3+3+4+3+3+3+3+3 = 35.

## 4. Information Architecture

```
/                                    (public landing, anonymous)
/login                               (credentials — see ADR 0002 Q4;
                                       routes by role after sign-in —
                                       learner -> /dashboard,
                                       facilitator -> /admin/roster —
                                       unless an explicit callbackUrl
                                       deep-link is present, which
                                       always wins — docs/features/
                                       0013-role-separation.md)
/dashboard                           (learner home — progress ring, status
                                       donut, competency bar chart, stat
                                       tiles — docs/features/
                                       0009-dashboard-snapshot.md)
/competencies/:id                    (concept content + exercise list;
                                       bespoke per-competency diagram +
                                       real booklet content — docs/
                                       features/0008-booklet-learn-
                                       refresh.md)
/competencies/:id/exercises/:exId    (mission, checklist, submission panel)
/submissions/new?exercise=:id        (attach evidence)
/submissions/:id                     (detail + facilitator comment)
/profile                             (learner's own full history — nav
                                       label "My Progress", not "Profile"
                                       — docs/features/
                                       0009-dashboard-snapshot.md)
/account                             (any role — view/edit name+email,
                                       change password — nav label
                                       "Profile" — docs/features/
                                       0010-account-profile.md)
/admin/roster                        (facilitator-only, their landing
                                       page; learner names link into
                                       /admin/learners/:userId)
/admin/submissions/:id               (review queue, decision control)
/admin/users                         (facilitator-only, list + add users
                                       with a temporary password —
                                       Chunk 8)
/admin/learners                      (facilitator-only, redirects to the
                                       alphabetically-first learner)
/admin/learners/:userId              (facilitator-only — any learner's
                                       real dashboard, same charts as
                                       /dashboard, via a picker dropdown
                                       — docs/features/
                                       0014-reviewer-learner-dashboard.md)
```

**Two separate shells, not one hybrid nav**: the learner shell
(`AppHeader`/`AppSidebar`) and the reviewer shell (admin's own header/
`AdminSidebar`) each show only their own role's nav — no stray "Admin"
link on the learner side, no stray "Learner view" link on the reviewer
side. A facilitator can still deliberately switch into the learner
shell via `RoleViewSwitcher` (a labeled dropdown, not an ambient link)
to preview that experience; a plain learner never sees that control at
all, since they have no second role to switch into.

**Fixed ordering**: competencies always render 01→12, exercises 01→04
within a competency — a deliberate learning path, never re-sorted by
recency or alphabet.

**Exercise gating**: open by default (§10.2 resolved) — no
locked/unlocked derived state on `submission` for v1.

## 5. Core User Flows

**Flow A — Learner completes an exercise**
1. Dashboard → competency → exercise (or "Continue where you left off").
2. Exercise detail shows Mission, Duration, Project link(s), How-To steps,
   Evidence checklist, Completion Criteria.
3. "Start" → status → `in_progress`, `started_at` recorded.
4. Learner works locally against the exercise-set repo (portal is never
   the code editor).
5. "Submit" → fills submission panel: link to branch/PR + evidence links
   matching the checklist + optional notes.
6. Status → `submitted`, visible in facilitator review queue.
7. Facilitator reviews (Flow B), marks `passed` or `needs_rework` with an
   optional comment.
8. Learner sees the decision; `needs_rework` reopens as `in_progress` with
   the comment attached.

**Flow B — Facilitator reviews a submission**
1. Admin → Roster, sorted by pending-submissions first.
2. Click a learner → per-competency grid → click a `submitted` cell.
3. Submission detail: evidence checklist from the exercise on the left,
   learner's links/notes on the right.
4. Decision: Passed / Needs Rework + comment → learner notified (in-app;
   email notifications are Phase 2).

## 6. Data Model

SQLite via Prisma (see `docs/adr/0001-stack-choice.md`). Field lists below
are what chunk 2 implements as `prisma/schema.prisma`.

- **Competency** — `id`, `number`, `title`, `subtitle`, `shiftMarkdown`,
  `masteryBullets` (JSON array), `commonMistakeMarkdown`, `toolkitTags`
  (JSON array).
- **Exercise** — `id`, `competencyId` (FK), `number`, `slug`, `title`,
  `missionMarkdown`, `durationLabel`, `howToSteps` (JSON array),
  `evidenceChecklist` (JSON array of `{label}`), `completionCriteria`
  (JSON array).
- **ExerciseProject** — `id`, `exerciseId` (FK), `repoPath`,
  `displayName`, `isPrimary`.
- **User** — `id`, `name`, `email`, `passwordHash`, `role`
  (`learner|facilitator`).
- **Submission** — `id`, `userId` (FK), `exerciseId` (FK), `status`
  (`not_started|in_progress|submitted|needs_rework|passed`), `startedAt`,
  `submittedAt`, `decidedAt`, `decidedById` (FK, nullable),
  `facilitatorComment`, `prLink`, `learnerNote`.
- **EvidenceArtifact** — `id`, `submissionId` (FK), `checklistLabel`
  (matches an entry in that exercise's `evidenceChecklist`), `kind`
  (`link|note`), `url`, `createdAt`.

`evidence_artifact` is its own table (not a JSON blob on `submission`) so
the review UI can render "which checklist items are covered" as a live
join — the same seam the original spec reserves for a future `verify_run`
table (Phase 2/3, out of scope here).

## 7. Roadmap / Build Plan

Chunked so each commit lands a coherent, working slice.

- [x] **Chunk 1 — Toolchain setup**: `AGENTS.md`/`CLAUDE.md`, guardrail
  hook + suggested settings, secret-scan pre-commit hook, this spec,
  architecture doc, ADRs, Next.js skeleton app that boots.
- [x] **Chunk 2 — Content model & seed** (this commit): `prisma/schema.prisma`,
  `content/seed.json` generated by `scripts/generate-seed.mjs` from the
  exercise-set repo's root README index table + all 35 exercise READMEs,
  plus the guidebook's `Competency-XX.html` pages for the 12 competencies'
  Shift/mastery/toolkit content — both real, non-fabricated sources, not
  vendored into this repo. `prisma/seed.ts` (idempotent upsert), and
  read-only `/competencies` + `/competencies/:number` +
  `/competencies/:number/exercises/:exerciseNumber` pages (no auth yet).
- [x] **Chunk 3 — Auth & roles** (this commit): NextAuth (v4) credentials,
  seeded demo learner/facilitator users, `/login`, role-gated `/admin/*`.
  Spec written first per Competency 02 (Spec Framing) —
  `docs/features/0003-auth-roles.md`; all 6 acceptance criteria verified
  end-to-end (redirect-to-login, callback-URL bounce-back, facilitator
  reaching `/admin`, learner getting a real HTTP 403 on `/admin`, wrong
  password rejected generically, clean build).
- [x] **Chunk 4 — Learner flow** (this commit): `/dashboard`, exercise
  detail wired to real start/submit, `/submissions/new`, `/submissions/:id`
  (Flow A steps 1–6 end-to-end). Spec first —
  `docs/features/0004-learner-flow.md`; all acceptance criteria verified
  live via Playwright against a built+served instance (start flips
  status, submit creates exactly the right evidence rows and flips to
  `submitted`, draft doesn't flip status, cross-user submission access is
  blocked, dashboard/competency pages show real per-user status).
- [x] **Chunk 5 — Facilitator flow** (this commit): `/admin/roster`,
  submission review + decision, needs_rework feedback loop (Flow B
  end-to-end). Spec first — `docs/features/0005-facilitator-flow.md`;
  acceptance criteria verified live via Playwright (roster pending count,
  decision persists status/decidedAt/decidedById/comment, pending list
  drops the item post-decision, learner sees needs_rework feedback and a
  resubmit path) plus direct SQLite checks. The decision action's role
  check is server-side and unconditional (`requireFacilitatorId` calls
  `forbidden()` regardless of caller), verified by code inspection rather
  than a forged raw request — noted honestly rather than overclaimed.
- [x] **Chunk 6 — Polish** (this commit): `/profile`, branded 404/error
  boundaries, a real GitHub-dark theme (ADR 0003) applied across every
  page, and a test suite (19 tests: seed-parser prose-fallback case,
  status-transition rules, roster aggregation) — vitest was deliberately
  not installed until now (chunk 1) specifically so its version could be
  checked for a clean `npm audit` at the moment it's actually needed
  (5.0.1, confirmed 0 vulnerabilities). Also closed two gaps surfaced
  while extracting the pure status-transition rules: a learner could
  resubmit evidence over an already-passed exercise, and a facilitator
  could double-decide a submission — both now rejected server-side
  (`lib/status.ts`'s `canSubmitEvidence`/`canDecide`), verified live.
  This completes the v1 MVP build plan.
- [x] **Chunk 7 — Post-MVP hardening** (this commit): click-to-learn
  Toolkit tags, Exercises/How To listing previews, and exercise-page
  artifact chips (real file match → reference template → glossary,
  reusing one shared resolver); a live QA pass (fresh learner +
  facilitator accounts run through the full start→submit→review→
  rework→resubmit→pass loop) that fixed three real gaps — 403 pages
  claiming "facilitators only" for non-role reasons, resubmitting a
  locked exercise with no warning until the form was already filled
  out, and a plain login skipping the real `/dashboard` page; and a
  Railway deployment (persistent volume for SQLite, auto-seed on every
  start) giving the app a real shareable URL.
- [x] **Chunk 8 — In-app user management** (this commit): `/admin/users`
  (facilitator-only) lists every user and adds a new one — name, email,
  a facilitator-set temporary password, and role. `createUser` in
  `app/actions.ts` reuses the existing `requireFacilitatorId` guard,
  validates server-side independent of the form's own HTML validation,
  and checks email uniqueness before creating rather than surfacing a
  raw Prisma constraint error. No email integration added — the
  facilitator shares the temporary password out of band, matching this
  app's existing no-email-integration stance (ADR 0002 Q4/Q6).

- [x] **Chunk 9 — Learn tab refresh from the real booklet** (this
  commit): the Learn tab for all 12 competencies rebuilt from the real
  "Agentic Engineering" guidebook booklet (v2 PDF) — real tagline,
  full Shift narrative, In Practice bullets, and a bespoke diagram per
  competency, rolled out one competency at a time and verified against
  the actual booklet pages. `docs/features/
  0008-booklet-learn-refresh.md`.
- [x] **Chunk 10 — Dashboard snapshot + "My Progress" rename** (this
  commit): "Profile" renamed to "My Progress" in nav (it's exercise
  history, not account settings); `/dashboard` rebuilt into a real
  at-a-glance snapshot — progress ring, status donut, competency bar
  chart, KPI tiles, an honest encouragement message. `docs/features/
  0009-dashboard-snapshot.md`.
- [x] **Chunk 11 — Account/Profile page** (this commit): `/account`
  (labeled "Profile" in nav, distinct from the renamed "My Progress"
  route) — view name/email/role, edit name/email, change password,
  for any role. `docs/features/0010-account-profile.md`.
- [x] **Chunk 12 — Realistic demo data** (this commit): `prisma/
  demo-data.ts` seeds 5 named learners at varied progress plus a named
  reviewer (Jordan Blake) with real decisions/comments, for
  conference/customer demos — additive to the original two bare demo
  accounts, not a replacement. `docs/features/
  0011-realistic-demo-data.md`.
- [x] **Chunk 13 — Mobile responsive pass** (this commit): every page
  verified live at 375px; fixed what actually broke — the shared
  shell (sidebar → slide-in drawer via `MobileNavContext`), a landing-
  page snake-ordering bug, and a title-truncation bug — rather than
  rewriting pages that already degraded fine. `docs/features/
  0012-mobile-responsive.md`.
- [x] **Chunk 14 — Separate the learner and reviewer experiences**
  (this commit): role-based post-login routing (facilitator →
  `/admin/roster`, learner → `/dashboard`), a facilitator-only
  `AdminSidebar` (no more shared `AppSidebar` showing meaningless
  personal-progress nav to a reviewer), and `RoleViewSwitcher` — a
  deliberate, labeled dropdown for a facilitator to preview the
  learner shell, replacing the old ambient "Admin"/"Learner view"
  cross-links. `docs/features/0013-role-separation.md`.
- [x] **Chunk 15 — Reviewer-facing learner dashboard** (this commit):
  `/admin/learners/:userId` — a facilitator-only view of any specific
  learner's real dashboard (same charts as `/dashboard`, extracted
  into a shared `LearnerDashboardView` component) via a picker
  dropdown, so a reviewer isn't limited to Roster's raw counts or
  their own empty preview dashboard. `docs/features/
  0014-reviewer-learner-dashboard.md`.

**Planned, not yet built** — `docs/features/
0007-project-starter-kits.md` scopes a start.spring.io-style wizard
(pick a stack + dependencies + rigor tier, get a tailored governance
kit: `AGENTS.md`/`spec.md`/`architecture.md`/guardrails/ADRs) plus a
deferred v2 (LLM-assisted drafting from uploaded project context). This
is a full spec with acceptance criteria but zero implementation so far
— no `content/stack-catalog.json`, no `lib/stack-kit.ts`, no
`app/starter-kit`.

Phase 2+ (explicitly deferred, not built here): cohorts and the
"quiet for 7+ days" signal, Stage 2 CI verification integration, email
notifications, toolkit-tag search/filter, multi-tenant/multi-org
support (see §9 below for the current thinking on this).

## 8. Evidence & Review Standard

Stage 1 (v1, manual) only: the learner runs `npm run verify:exercise`
themselves in their own clone and pastes/links the output as evidence. The
facilitator's review question is the same one the exercise-set repo's own
`SUBMISSION_STANDARD.md` asks: *record exact commands, results, and exit
codes — don't claim a check passed without proof.* The portal puts that
existing standard into a UI; it does not invent a new bar.

## 9. Multi-tenant / SaaS pivot — open questions (not yet decided)

Raised 2026-09-23: turn this into a SaaS product any company can run,
with a Company entity, company-scoped roles, and a company dashboard.
This reopens ADR 0002 Q1, which deliberately ruled multi-tenancy out of
v1 as "a genuine product pivot ... not a cheap-to-add-later toggle worth
pre-building" — that assessment still holds. Nearly every table
(`User`, `Submission`, `EvidenceArtifact`, and arguably `Competency`/
`Exercise` if companies can ever customize curriculum) and every query
in `lib/roster.ts`, `lib/dashboard-stats.ts`, `requireCurrentUser()`,
and the `/admin/**` role guard would need a tenant boundary, not just an
added table. Per this repo's own convention (spec before
implementation, competency 02), this needs a real spec — written before
any schema change — covering at minimum:

- **Isolation model**: a `companyId` column + row-level scoping (single
  shared DB, cheaper, must be enforced in *every* query — one missed
  `where` clause leaks another company's data), vs. schema-per-tenant or
  DB-per-tenant (stronger isolation, real operational cost). Given this
  app's current single-SQLite-file-on-a-Railway-volume deployment (§7
  Chunk 7), shared-DB-with-`companyId` is the only one that doesn't
  also force a deployment-model change at the same time.
- **Role model**: does "facilitator" split into a company-scoped
  reviewer plus a company-admin (manages that company's users/billing/
  branding) plus a platform-admin (manages companies themselves)? Three
  tiers, not two — a different shape than today's flat `learner |
  facilitator` enum.
- **"Plugged into any company portal"**: what does embedding actually
  mean here — SSO/SAML into an existing identity provider (reopens ADR
  0002 Q4, which explicitly deferred SSO), an iframe embed, or a
  headless API the host portal calls? Each implies different auth and
  UI work; "plug in" is three different features depending on which one
  is meant.
- **Content model**: shared curriculum (12 competencies/35 exercises,
  same for every company — cheap) vs. per-company customization of
  competencies/exercises (expensive, reopens "in-app authoring UI",
  explicitly out of scope for v1 in §1).
- **Company dashboard**: aggregated across which axis — a company's own
  roster (close to today's `/admin/roster`, generalized with a
  `companyId` filter) vs. cross-company platform metrics (a genuinely
  new, higher-privilege view)?

No implementation started. Answering these (likely as ADR 0004) is the
next step before any code changes, since the isolation-model choice
alone determines whether this is an additive migration or a rebuild of
every query in the app.
