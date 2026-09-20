// Real, usable reference templates for the toolkit tags that are worth
// more than a one-line explanation — a blank template plus a worked
// example, the way RUP ships a template for every artifact. These are
// authored reference material (established real-world conventions: MADR,
// EARS, Gherkin, the AGENTS.md spec, GitHub's PR template convention), not
// a claim that this exact file exists in the learner's own exercise repo
// — that distinction is what keeps this honest. Where the exercise-set
// repo's own real docs already showed a concrete structure (spec.md's
// REQ-XXX/AC-XXX/Given-When-Then shape, guardrail policy.json's field
// names), these templates follow that structure directly.
export type ArtifactTemplateDoc = {
  id: string;
  filename: string;
  title: string;
  content: string;
};

export type ArtifactTemplateEntry = {
  intro: string;
  docs: ArtifactTemplateDoc[];
};

function doc(id: string, filename: string, title: string, content: string): ArtifactTemplateDoc {
  return { id, filename, title, content: content.trim() };
}

const SPEC_TEMPLATE = doc(
  "spec-template",
  "spec.md (template)",
  "Spec Template",
  `
# Spec: <feature name>

## Clarifications

### Q1: <question that needs an answer before writing requirements>
- Category: Authorization | Billing | Failure | Scope
- Repository evidence: <file/line, or "none found">
- Status: Confirmed | Assumption
- Decision: <the answer>
- Consequence: <what this decision rules in or out>

## Specification

### REQ-001: <requirement name>
<One sentence describing what must be true.>

### AC-001: <acceptance criterion name>
- Given <starting state>
- When <action happens>
- Then <expected result>

## Plan and Tasks

## PLAN-001: <plan item name>
References: REQ-001

## TASK-001: <task name>
References: REQ-001, AC-001
`,
);

const SPEC_EXAMPLE = doc(
  "spec-example",
  "spec.md (worked example)",
  "Spec Example",
  `
# Spec: Password Reset Rate Limiting

## Clarifications

### Q1: How many reset attempts should be allowed before blocking?
- Category: Failure
- Repository evidence: docs/security-notes.md line 12 mentions "no current rate limit"
- Status: Confirmed
- Decision: 5 attempts per email address per hour
- Consequence: A 6th attempt within the hour returns a 429, not a silent failure

## Specification

### REQ-001: Rate-limit password reset requests per email address
A user requesting a password reset for the same email more than 5 times within a rolling hour must be blocked from triggering a 6th reset email.

### AC-001: Sixth attempt is blocked
- Given a user has requested 5 password resets for the same email in the last hour
- When they request a 6th reset for that email
- Then the API returns 429 and no reset email is sent

### AC-002: Attempts reset after the window
- Given a user hit the 5-attempt limit 61 minutes ago
- When they request a reset now
- Then the request succeeds and a reset email is sent

## Plan and Tasks

## PLAN-001: Add a rate limiter to the reset endpoint
References: REQ-001

## TASK-001: Track reset attempts per email in a sliding window
References: REQ-001, AC-001, AC-002

## TASK-002: Return 429 with a Retry-After header on block
References: REQ-001, AC-001
`,
);

const AGENTS_MD_TEMPLATE = doc(
  "agents-template",
  "AGENTS.md (template)",
  "AGENTS.md Template",
  `
# AGENTS.md

## Setup
<Commands to install dependencies and get the project running.>

## Commands
- Build: \`<command>\`
- Test: \`<command>\`
- Lint: \`<command>\`

## Code Style
<Conventions a linter doesn't already enforce — naming, file layout, patterns to prefer or avoid.>

## Repository Rules
<Hard constraints: what must never change, what needs approval, backward-compatibility requirements.>

## Testing
<What "done" requires — coverage expectations, which test suite to run before finishing.>

## PR Instructions
<Title/description format, what evidence to include.>
`,
);

const AGENTS_MD_EXAMPLE = doc(
  "agents-example",
  "AGENTS.md (worked example)",
  "AGENTS.md Example",
  `
# AGENTS.md

## Setup
\`npm install\` then \`npm run db:seed\` to get a working local database.

## Commands
- Build: \`npm run build\`
- Test: \`npx vitest run\`
- Lint: \`npm run lint\`

## Code Style
Business logic lives in \`lib/*.ts\` as pure functions, separated from anything that touches Prisma or the DOM, so it's testable without a database. Prefer editing an existing file over creating a new one.

## Repository Rules
Keep public API response shapes backward compatible. Do not rename exported functions from \`lib/\` without updating every call site. Never commit \`.env\` or anything under \`prisma/dev.db\`.

## Testing
Run \`npx vitest run\` before finishing — all tests must pass. Add a test for every bug fix that reproduces the original failure.

## PR Instructions
Title: \`<type>: <short description>\` (e.g. \`fix: rate-limit password reset\`). Description must state what changed and how it was verified (command + result).
`,
);

const ADR_TEMPLATE = doc(
  "adr-template",
  "ADR-000-template.md (MADR template)",
  "ADR Template (MADR)",
  `
# <short decision title>

## Context and Problem Statement
<What problem forced this decision? 2-3 sentences.>

## Decision Drivers
- <driver 1>
- <driver 2>

## Considered Options
- <option 1>
- <option 2>
- <option 3>

## Decision Outcome
Chosen option: "<option>", because <justification>.

### Consequences
- Good, because <positive consequence>
- Bad, because <negative consequence / tradeoff accepted>
`,
);

const ADR_EXAMPLE = doc(
  "adr-example",
  "ADR-003-worked-example.md",
  "ADR Worked Example",
  `
# Use SQLite for local development, Postgres-compatible schema for production

## Context and Problem Statement
We need a database for the MVP. The team is small, deploy targets aren't finalized, and we don't want schema decisions today to block a later move to a hosted Postgres.

## Decision Drivers
- Zero setup cost for new contributors
- Must not require schema rewrites to move to Postgres later
- CI needs a database with no external service dependency

## Considered Options
- SQLite for both dev and production
- Postgres everywhere (via Docker)
- SQLite for dev, Postgres-compatible schema, migrate later

## Decision Outcome
Chosen option: "SQLite for dev, Postgres-compatible schema, migrate later", because it removes setup friction now while keeping the schema (via Prisma, no SQLite-only types) portable to Postgres without a rewrite.

### Consequences
- Good, because a new contributor runs the app with zero external setup
- Bad, because SQLite-specific behavior (e.g. concurrent writes) won't be caught until the Postgres migration is actually tested
`,
);

const ARCHITECTURE_TEMPLATE = doc(
  "architecture-template",
  "architecture.md (template)",
  "Architecture.md Template",
  `
# Architecture

## Overview
<One paragraph: what this system does and its main components.>

## Components
- **<component>** — <its responsibility>
- **<component>** — <its responsibility>

## Data Flow
<How a request or piece of data moves through the components, start to finish.>

## Key Decisions
<Link to the ADRs that explain non-obvious choices, rather than re-explaining them here.>
`,
);

const ARCHITECTURE_EXAMPLE = doc(
  "architecture-example",
  "architecture.md (worked example)",
  "Architecture.md Example",
  `
# Architecture

## Overview
A Next.js App Router app backed by SQLite via Prisma. Server components fetch data directly from Prisma; there is no separate API layer for the app's own UI.

## Components
- **app/(app)/** — authenticated pages, sharing one layout (header + sidebar)
- **lib/*.ts** — pure business logic (status transitions, roster aggregation), extracted so it's testable without a database
- **prisma/schema.prisma** — the data model; \`prisma/seed.ts\` upserts real content into it idempotently

## Data Flow
A page's server component queries Prisma directly, passes plain data down to client components for interactivity (tabs, copy buttons), and never exposes the Prisma client to the browser.

## Key Decisions
See docs/adr/0001-stack-choice.md (why SQLite) and docs/adr/0003-github-dark-theme.md (why this visual system).
`,
);

const CONVENTIONS_TEMPLATE = doc(
  "conventions-template",
  "conventions.md (template)",
  "Conventions.md Template",
  `
# Conventions

## Naming
<File, variable, and component naming rules.>

## File Organization
<Where new code of each kind goes.>

## Testing
<Test file location, naming, what must be covered.>

## Commit Style
<Format expected for commit messages.>
`,
);

const CONVENTIONS_EXAMPLE = doc(
  "conventions-example",
  "conventions.md (worked example)",
  "Conventions.md Example",
  `
# Conventions

## Naming
Components: PascalCase file matching the export (\`GuidanceDocs.tsx\`). Pure logic modules: kebab-case under \`lib/\` (\`competency-style.ts\`).

## File Organization
Business logic that doesn't touch Prisma or the DOM goes in \`lib/\`. Page-specific components live beside the page that uses them; components shared across 2+ pages move up to the nearest common route-group folder.

## Testing
One test file per lib module: \`__tests__/<module-name>.test.ts\`. Every pure function gets at least an empty-input case and a real-data case.

## Commit Style
\`<short imperative summary>\`, body explains why not what, references the file(s) changed only when it adds clarity.
`,
);

const PR_TEMPLATE = doc(
  "pr-template",
  ".github/pull_request_template.md",
  "PR Template",
  `
## What changed
<One or two sentences.>

## Why
<The problem this solves, or the requirement it satisfies.>

## Evidence
- [ ] Tests pass: \`<command>\` → <result>
- [ ] Manually verified: <what you did, what you saw>

## Screenshots (if UI)
<Before/after, if applicable.>
`,
);

const PR_EXAMPLE = doc(
  "pr-example",
  "PR #142 (worked example)",
  "PR Description Example",
  `
## What changed
Added a rate limit (5/hour) to the password-reset endpoint.

## Why
Nothing currently stops repeated reset-email spam against one address (see spec.md REQ-001).

## Evidence
- [x] Tests pass: \`npx vitest run\` → 12/12 passing, including the new rate-limit test
- [x] Manually verified: hit the endpoint 6 times locally, confirmed the 6th returns 429 with Retry-After

## Screenshots (if UI)
N/A — backend-only change.
`,
);

const GIVEN_WHEN_THEN = doc(
  "gwt-example",
  "acceptance-criteria.md",
  "Given/When/Then Example",
  `
### AC-001: Blocked after limit reached
- **Given** a user has made 5 password reset requests for the same email in the last hour
- **When** they request a 6th reset for that email
- **Then** the API responds 429 and no email is sent

### AC-002: Allowed again after the window passes
- **Given** the user's last blocked attempt was 61 minutes ago
- **When** they request a reset now
- **Then** the request succeeds
`,
);

const EARS_EXAMPLE = doc(
  "ears-example",
  "requirements-ears.md",
  "EARS Syntax Example",
  `
EARS (Easy Approach to Requirements Syntax) patterns:

- **Ubiquitous:** The system shall encrypt all evidence artifacts at rest.
- **Event-driven:** When a submission is marked passed, the system shall notify the learner within 5 minutes.
- **State-driven:** While a submission is in "needs_rework" state, the system shall block a new Submit action until the learner edits at least one field.
- **Unwanted behavior:** If the evidence upload exceeds 10MB, then the system shall reject it with a clear error, not fail silently.
- **Optional feature:** Where email notifications are enabled, the system shall send a digest at 9am local time.
`,
);

const BEHAVIOR_SPEC_EXAMPLE = doc(
  "behavior-spec-example",
  "behavior-spec.md",
  "Behavior Spec Example",
  `
# Behavior: Legacy discount calculator

Before refactoring, the current behavior (not the "correct" behavior) must be captured exactly:

- Given a cart with 3 items and no coupon, when checkout runs, then the discount applied is 0.
- Given a cart with a "SAVE10" coupon and subtotal $50, when checkout runs, then the discount is $5 (10%), floored to the nearest cent.
- Given a cart with a "SAVE10" coupon and subtotal $4.99, when checkout runs, then the discount is $0 (the legacy code has an undocumented $5 minimum — preserve this until a real spec says otherwise).
`,
);

const HOOKS_EXAMPLE = doc(
  "hooks-example",
  ".claude/settings.json (PreToolUse hook example)",
  "PreToolUse Hook Example",
  `
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/guardrails/enforce.mjs"
          }
        ]
      }
    ]
  }
}
`,
);

const STOP_HOOKS_EXAMPLE = doc(
  "stop-hooks-example",
  ".claude/settings.json (Stop hook example)",
  "Stop Hook Example",
  `
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "npm run verify:exercise"
          }
        ]
      }
    ]
  }
}
`,
);

const SANDBOX_POLICY_EXAMPLE = doc(
  "sandbox-policy-example",
  "guardrails/policy.json",
  "Guardrail Policy Example",
  `
{
  "version": 1,
  "defaultDecision": "blocked",
  "allowedOperations": ["read", "write", "run"],
  "allowedPaths": ["src/**", "tests/**"],
  "blockedPaths": ["secrets/**", ".env"],
  "approvalPaths": ["migrations/**"],
  "blockedCommands": ["rm -rf /", "git push --force"],
  "approvalCommands": ["npm publish"],
  "blockedPromptPatterns": ["ignore (all )?previous instructions"]
}
`,
);

const SECRET_SCANNING_EXAMPLE = doc(
  "secret-scanning-example",
  ".pre-commit-config.yaml (secret scanning)",
  "Secret Scanning Example",
  `
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.4
    hooks:
      - id: gitleaks
`,
);

const FEATURE_FLAG_EXAMPLE = doc(
  "feature-flag-example",
  "feature-flags.ts",
  "Feature Flag Example",
  `
// Toggle without a new deploy — check the flag, never hardcode the branch.
if (isFeatureEnabled("new-checkout-flow", userId)) {
  return renderNewCheckout();
}
return renderLegacyCheckout();
`,
);

const STRANGLER_EXAMPLE = doc(
  "strangler-example",
  "strangler-migration-notes.md",
  "Strangler Pattern Example",
  `
# Migrating checkout to the new service

1. Route 0% of traffic to the new checkout service; keep the legacy path as the only real path.
2. Add a routing layer that can send a request to either implementation by user ID.
3. Ramp: 1% → 10% → 50% → 100%, comparing error rates and output at each step.
4. Once at 100% for one full billing cycle with no regressions, delete the legacy implementation.
`,
);

const CHARACTERIZATION_TEST_EXAMPLE = doc(
  "characterization-test-example",
  "legacy-discount.characterization.test.ts",
  "Characterization Test Example",
  `
// Locks in what the code CURRENTLY does, not what it should do —
// the safety net before refactoring legacy code with no spec.
test("legacy: SAVE10 coupon under $5 subtotal gives $0 discount (undocumented minimum)", () => {
  expect(calculateDiscount({ subtotal: 4.99, coupon: "SAVE10" })).toBe(0);
});
`,
);

const REPO_MAP_EXAMPLE = doc(
  "repo-map-example",
  "repo-map.md (generated excerpt)",
  "Repo Map Example",
  `
lib/
  status.ts        — pure submission status-transition rules
  roster.ts         — facilitator roster aggregation
  competency-style.ts — per-competency color/icon lookup
app/(app)/
  dashboard/page.tsx — learner home, progress overview
  competencies/[number]/ — competency Learn/How To/Exercises tabs
`,
);

const MERMAID_EXAMPLE = doc(
  "mermaid-example",
  "flow.mmd",
  "Mermaid Diagram Example",
  `
\`\`\`mermaid
flowchart LR
  A[Learner submits evidence] --> B{Facilitator reviews}
  B -->|Passed| C[Exercise complete]
  B -->|Needs rework| D[Learner edits + resubmits]
  D --> B
\`\`\`
`,
);

const C4_EXAMPLE = doc(
  "c4-example",
  "context-diagram.mmd",
  "C4 Context Diagram Example",
  `
\`\`\`mermaid
C4Context
  Person(learner, "Learner")
  Person(facilitator, "Facilitator")
  System(portal, "Agentic LMS Portal")
  System_Ext(repo, "Exercise-set repository")
  Rel(learner, portal, "Submits evidence")
  Rel(facilitator, portal, "Reviews submissions")
  Rel(portal, repo, "Content generated from")
\`\`\`
`,
);

const GIT_WORKTREES_EXAMPLE = doc(
  "worktrees-example",
  "worktree-commands.sh",
  "Git Worktrees Example",
  `
# Check out a second branch into its own directory, so two agents
# (or an agent and a human) can work in parallel without stashing.
git worktree add ../repo-lane-a feature/lane-a
git worktree add ../repo-lane-b feature/lane-b
git worktree list --porcelain
git worktree remove ../repo-lane-a
`,
);

const GH_CLI_EXAMPLE = doc(
  "gh-cli-example",
  "gh-commands.sh",
  "gh CLI Example",
  `
gh pr create --title "fix: rate-limit password reset" --body-file pr-body.md
gh pr checks 142 --watch
gh pr view 142 --json reviews,statusCheckRollup
`,
);

const PLAYWRIGHT_EXAMPLE = doc(
  "playwright-example",
  "login.spec.ts",
  "Playwright Test Example",
  `
import { test, expect } from "@playwright/test";

test("learner can log in and reach the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("learner@example.com");
  await page.getByLabel("Password").fill("learner-demo-pw");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\\/(dashboard|competencies)/);
});
`,
);

export const ARTIFACT_TEMPLATES: Record<string, ArtifactTemplateEntry> = {
  "spec.md": {
    intro: "A written spec that's structured enough for an agent to implement without guessing — real IDs for requirements and acceptance criteria, so every task traces back to one.",
    docs: [SPEC_TEMPLATE, SPEC_EXAMPLE],
  },
  "agents.md": {
    intro: "The file coding agents read first. Keep it short — setup, commands, hard constraints, what \"done\" requires.",
    docs: [AGENTS_MD_TEMPLATE, AGENTS_MD_EXAMPLE],
  },
  "claude.md": {
    intro: "Claude Code's project-level instruction file — same convention and purpose as AGENTS.md.",
    docs: [AGENTS_MD_TEMPLATE, AGENTS_MD_EXAMPLE],
  },
  adrs: {
    intro: "One ADR per significant decision, in the MADR (Markdown ADR) format — so the reasoning survives past the conversation that made it.",
    docs: [ADR_TEMPLATE, ADR_EXAMPLE],
  },
  "adr / madr": {
    intro: "The MADR template itself — Context, Drivers, Options, Outcome, Consequences.",
    docs: [ADR_TEMPLATE, ADR_EXAMPLE],
  },
  "architecture.md": {
    intro: "A map of the system's structure and data flow — what an agent reads before a change that crosses multiple parts of the codebase.",
    docs: [ARCHITECTURE_TEMPLATE, ARCHITECTURE_EXAMPLE],
  },
  "conventions.md": {
    intro: "The conventions a linter can't enforce — naming, file layout, testing and commit style.",
    docs: [CONVENTIONS_TEMPLATE, CONVENTIONS_EXAMPLE],
  },
  "pr template": {
    intro: "A checklist embedded in the repo that pre-fills every PR, prompting for the evidence a reviewer actually needs.",
    docs: [PR_TEMPLATE, PR_EXAMPLE],
  },
  "given/when/then": {
    intro: "The structured format behind unambiguous acceptance criteria.",
    docs: [GIVEN_WHEN_THEN],
  },
  "acceptance criteria": {
    intro: "Written as Given/When/Then so \"done\" is checkable, not a matter of opinion.",
    docs: [GIVEN_WHEN_THEN],
  },
  ears: {
    intro: "Easy Approach to Requirements Syntax — five sentence patterns that make a requirement precise enough to implement without guessing.",
    docs: [EARS_EXAMPLE],
  },
  "behavior spec": {
    intro: "For legacy code with no written spec: capture what the system currently does, not what it should do, before touching it.",
    docs: [BEHAVIOR_SPEC_EXAMPLE],
  },
  "pretooluse hooks": {
    intro: "A hook that runs before a tool call, so a script can approve or block it — the real enforcement point for a guardrail.",
    docs: [HOOKS_EXAMPLE],
  },
  "stop/pretooluse hooks": {
    intro: "PreToolUse blocks a risky action before it happens; Stop catches incomplete work before the agent declares itself done.",
    docs: [HOOKS_EXAMPLE, STOP_HOOKS_EXAMPLE],
  },
  sandboxing: {
    intro: "A real policy file shape for what an agent may read, write, or run — default-deny, explicit allow list.",
    docs: [SANDBOX_POLICY_EXAMPLE],
  },
  "secret scanning": {
    intro: "A pre-commit hook that blocks a commit containing anything that looks like a credential.",
    docs: [SECRET_SCANNING_EXAMPLE],
  },
  "feature flags": {
    intro: "A runtime switch so a risky change can ship dark and roll out gradually — or roll back instantly, with no new deploy.",
    docs: [FEATURE_FLAG_EXAMPLE],
  },
  "strangler pattern": {
    intro: "Migrate by routing an increasing share of traffic to the new implementation, never a big-bang cutover.",
    docs: [STRANGLER_EXAMPLE],
  },
  "characterization tests": {
    intro: "Tests that lock in current (not correct) behavior — the safety net before refactoring code with no spec.",
    docs: [CHARACTERIZATION_TEST_EXAMPLE],
  },
  "repo-maps": {
    intro: "A compact structural overview handed to an agent instead of the whole repo — much cheaper context.",
    docs: [REPO_MAP_EXAMPLE],
  },
  mermaid: {
    intro: "Text-based diagrams that render straight from Markdown — an agent can produce one as plain text.",
    docs: [MERMAID_EXAMPLE],
  },
  c4: {
    intro: "The C4 model's top level — who uses the system and what it talks to, before zooming into containers or components.",
    docs: [C4_EXAMPLE],
  },
  "git worktrees": {
    intro: "Multiple branches checked out into separate directories, so parallel agents don't collide on one working copy.",
    docs: [GIT_WORKTREES_EXAMPLE],
  },
  "gh cli": {
    intro: "GitHub's official CLI — open PRs and check CI status without leaving the terminal.",
    docs: [GH_CLI_EXAMPLE],
  },
  playwright: {
    intro: "Browser automation for end-to-end tests that click through a real UI, the way a user would.",
    docs: [PLAYWRIGHT_EXAMPLE],
  },
};

export function artifactTemplateEntry(tag: string): ArtifactTemplateEntry | undefined {
  return ARTIFACT_TEMPLATES[tag.toLowerCase().trim()];
}
