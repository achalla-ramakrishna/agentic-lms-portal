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
- In-app user management — every account (including the two demo ones)
  exists only because `prisma/seed.ts` put it there; no signup or admin
  "add learner/facilitator" screen. Fine for one seeded cohort, a real
  gap identified during a live QA pass before onboarding a second one
  (see §7 Roadmap).

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
/login                               (credentials — see ADR 0002 Q4)
/dashboard                           (learner home)
/competencies/:id                    (concept content + exercise list)
/competencies/:id/exercises/:exId    (mission, checklist, submission panel)
/submissions/new?exercise=:id        (attach evidence)
/submissions/:id                     (detail + facilitator comment)
/profile                             (learner's own full history)
/admin/roster                        (facilitator-only)
/admin/submissions/:id               (review queue, decision control)
```

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

Phase 2+ (explicitly deferred, not built here): cohorts and the
"quiet for 7+ days" signal, Stage 2 CI verification integration, email
notifications, toolkit-tag search/filter, in-app user management (no
signup or admin "add user" screen exists yet — see §1's out-of-scope
list).

## 8. Evidence & Review Standard

Stage 1 (v1, manual) only: the learner runs `npm run verify:exercise`
themselves in their own clone and pastes/links the output as evidence. The
facilitator's review question is the same one the exercise-set repo's own
`SUBMISSION_STANDARD.md` asks: *record exact commands, results, and exit
codes — don't claim a check passed without proof.* The portal puts that
existing standard into a UI; it does not invent a new bar.
