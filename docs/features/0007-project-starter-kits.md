# Feature spec — Project Starter Kits (start.spring.io–style wizard for governance kits)

Written before any implementation, per this repo's own convention
(competency 02, Spec Framing). This is a planning spec: it scopes a v1
slice deliberately small and defers the large, genuinely open questions
rather than guessing at them — see **Open questions** at the end.

## The scoping call this spec makes, and why

The request that prompted this ("start.spring.io style... choose
dependencies... it can follow our 12-step competency approach... quality
of md files depends on inputs") describes two different features layered
together:

1. **A code scaffolder** — pick a stack + dependencies, get back a
   runnable project skeleton (what start.spring.io / Spring Initializr
   actually does).
2. **A governance-kit generator** — pick a stack + dependencies + a domain
   complexity tier, get back a tailored `AGENTS.md`, `spec.md`,
   `architecture.md`, guardrails, and ADRs for an AI coding agent to work
   from.

(1) is a fundamentally different, much larger engineering effort — it
means reimplementing what each language ecosystem's own official
generator already does (Spring Initializr for Java, `create-next-app`/
`npm create vite` for JS, `django-admin startproject`/cookiecutter for
Python, `dotnet new` for .NET), correctly, for every framework combination
someone might pick. That's not this LMS's job, and doing it badly would
actively mislead learners.

(2) is a natural extension of work already in this repo:
`lib/artifact-templates.ts` already generates real, usable `spec.md`,
`AGENTS.md`, ADR, `architecture.md`, and guardrail-policy templates — just
generic ones, not parameterized by stack. It's also exactly the thing this
whole curriculum is teaching: better inputs to an agent produce better
output, and "toolchain kit for a todo app vs. a banking app" is a
governance-rigor question, not a scaffolding question.

**This spec covers (2) only.** A learner who wants the actual runnable
skeleton still runs the ecosystem's own official generator (Spring
Initializr, `create-next-app`, etc.) — v1's job is to hand them the
governance kit to drop into whatever that generator produces, then work
from there with an agent. Actual code scaffolding is listed under **Non-
goals** and **Open questions**, not silently dropped.

## Goal

A learner (or the app's own content authors, initially) can answer a short
wizard — primary stack, a handful of dependencies/building blocks specific
to that stack, and a domain complexity tier — and get back a coherent,
stack-flavored governance kit: `AGENTS.md`, a blank `spec.md` template, an
`architecture.md` template with stack-specific known-concerns called out,
a **filled-in** `ADR-0001-stack-choice.md` (the wizard's own selections
are the decision being recorded), a guardrail `policy.json` with
stack-appropriate blocked/approval commands, and `conventions.md`. The
kit is downloadable/copyable, the same way `GuidanceDocs` already lets a
learner copy a template today.

## Non-goals (explicitly deferred)

- **Generating runnable source code** (the actual "Spring Initializr"
  part). See scoping call above — this needs its own spec and its own
  decision about whether it's in scope for this product at all, not a
  guess baked into v1.
- **"Any tech stack."** v1 ships a small, curated catalog (a handful of
  stacks) so the content can be real and verified, not templated
  boilerplate — same discipline as this session's toolkit templates
  (spec.md's structure came from the real exercise-set repo, not
  invented). Growing the catalog is the explicit growth path, not a v1
  requirement.
- **Wiring into submission/evidence tracking.** A learner using this
  wizard doesn't get a gradable exercise out of it in v1 — this is a
  standalone utility, not a 36th exercise. Making a user's own chosen
  project a first-class, progress-tracked alternative to the 35 fixed
  exercises (the "follow our 12-step competency approach" part of the
  request) is real and important, but is a data-model question of its
  own — see Open questions and the growth path below.
- **Detecting/importing an existing codebase's stack.** v1 is for a new
  project's starting kit only.
- **Exhaustive dependency coverage.** Enough real fragments to prove the
  concept for a couple of dependencies per stack (e.g. Kafka for one
  stack), not a complete catalog of every possible building block.

## User-facing behavior (v1)

1. New entry point, `/starter-kit` (name TBD — see Open questions),
   linked from the dashboard/sidebar, available to any logged-in user
   (not facilitator-gated — this is a learning tool, not an admin
   function).
2. **Step 1 — Stack**: choose one primary stack from a short curated list
   (e.g. Spring Boot/Java, Node.js/Express, Python/FastAPI — exact
   starting set is an Open question, not decided here).
3. **Step 2 — Dependencies**: multi-select from a stack-specific list of
   building blocks (e.g. Spring Boot: Web, Data JPA, PostgreSQL,
   Security, Kafka; Node/Express: Express, Prisma, PostgreSQL, Redis,
   BullMQ, JWT auth). Mirrors start.spring.io's own dependency-picker UX,
   minus the "generate zip" step.
4. **Step 3 — Domain / rigor tier**: Simple / Standard / Regulated (the
   "todo app vs. banking app" distinction from the request). Affects
   which guardrail rules and which extra ADRs get included (e.g.
   Regulated adds an audit-trail ADR and stricter blocked-command
   defaults; Simple keeps the guardrail policy minimal).
5. On submit: renders the generated kit using the same `GuidanceDocs`
   collapsible/copy component already used for every other template in
   this app — no new rendering component needed.
6. Each generated doc is composed from small, reusable, stack/dependency-
   tagged fragments (see Data model) rather than one giant per-stack
   template — this is what makes "grows slowly" actually true: adding a
   new dependency later means adding a fragment, not rewriting a
   monolithic template per stack.

## Data model

A new content catalog, hand-authored and verified the same way
`content/seed.json` and `lib/artifact-templates.ts` are — real
conventions for each stack/dependency, not invented boilerplate:

```
content/stack-catalog.json
{
  "stacks": [
    {
      "id": "spring-boot",
      "label": "Spring Boot (Java)",
      "testCommand": "mvn test",
      "buildCommand": "mvn package",
      "dependencies": ["web", "data-jpa", "postgres", "security", "kafka"]
    },
    ...
  ],
  "dependencies": [
    {
      "id": "kafka",
      "label": "Kafka (event processing)",
      "architectureConcerns": "Consumer group rebalancing, at-least-once delivery and idempotent handlers, topic/partition strategy, schema evolution.",
      "guardrailRules": { "approvalCommands": ["kafka-topics.sh --delete"], ... }
    },
    ...
  ]
}
```

`lib/artifact-templates.ts`'s doc-building functions become parameterized
(take a stack + selected dependencies + rigor tier, interpolate the
stack's real test/build commands and each dependency's real concerns)
instead of returning fixed strings — an extension of the existing module,
not a parallel one.

## Implementation

- `content/stack-catalog.json` + a `scripts/`-style verification (every
  dependency referenced by a stack must exist in the catalog; every
  fragment must be non-trivial length) — same test discipline as
  `artifact-templates.test.ts`.
- `lib/stack-kit.ts` (new): `buildStarterKit(stackId, dependencyIds,
  rigorTier)` → the same `ArtifactTemplateDoc[]` shape `GuidanceDocs`
  already renders, so no new UI component is needed.
- `app/starter-kit/page.tsx` + a small client wizard component (3 steps,
  local component state — no new server state needed since nothing is
  persisted in v1).
- No schema changes — v1 generates and displays; it doesn't save
  anything to the database. (Whether to let a user save/revisit a
  generated kit is an Open question, not decided here.)

## Acceptance criteria

- [ ] Every dependency listed under a stack in the catalog has a
  corresponding fragment — no dead references (mirrors the existing
  `artifact-templates.test.ts` no-dead-keys pattern).
- [ ] Every stack's `ADR-0001-stack-choice.md` output is genuinely filled
  in with that stack's real name/build/test commands, not a blank
  template — it's recording the decision the wizard just made.
- [ ] Choosing the Regulated rigor tier visibly changes the generated
  guardrail policy (more blocked/approval commands) and adds at least
  one extra ADR compared to Simple, for the same stack/dependencies.
- [ ] The generated kit renders through the existing `GuidanceDocs`
  component with working Copy buttons — no new rendering component.
- [ ] `npm run build` succeeds; `npm test` covers the catalog's
  integrity (no dead dependency references, no empty fragments).

## Growth path (explicitly phased — this is how "grows slowly" happens)

- **Phase 2**: widen the stack catalog (more languages/frameworks) and
  the dependency fragment library (more real-world concern packs beyond
  the v1 proof-of-concept set — gRPC, GraphQL, multi-tenant SaaS
  patterns, etc.), each addition verified against real conventions the
  same way this session's spec.md/guardrail templates were grounded in
  the real exercise-set repo.
- **Phase 3**: the actual pedagogical integration hinted at in the
  original request — let a learner's own generated-kit project become a
  first-class, progress-tracked alternative to the 35 fixed exercises,
  walking the same 12 competencies. This needs its own spec: how
  evidence/submission tracking works for a project whose scope isn't
  fixed and pre-written the way the 35 exercises are, and whether a
  facilitator can meaningfully review work on a project they didn't
  design.
- **Phase 4 (speculative)**: actual code scaffolding. Only worth
  revisiting if Phase 2/3 prove the governance-kit concept earns its
  keep, and only as its own spec with its own honest scoping — not a
  default extension of this one.

## Open questions (not decided here — need your call before v1 starts)

- **Q1 — Confirm the scoping call above**: v1 = governance-kit generator
  only, not a code scaffolder. Is that the right split, or did you want
  the actual runnable-skeleton part sooner than Phase 4?
- **Q2 — Starting stack set**: which 3–4 stacks launch v1? Needs to be
  stacks someone can actually verify real conventions for (test/build
  commands, real guardrail concerns) — same rigor as this session's
  templates, not guessed.
- **Q3 — Placement**: standalone top-level feature (own nav entry), or
  nested as an alternate path into Competency 01 (Toolchain Setup)?
  Affects whether it needs its own onboarding copy or borrows the
  competency's existing framing.
- **Q4 — Content authorship**: who researches and writes the per-stack/
  per-dependency fragments? This is real research work (verifying actual
  conventions per ecosystem), not something to fabricate quickly.
- **Q5 — Persistence**: should a generated kit be saveable/revisitable
  (needs a schema change), or is regenerate-on-demand fine for v1?
