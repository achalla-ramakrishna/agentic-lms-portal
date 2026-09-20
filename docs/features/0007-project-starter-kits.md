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
- **LLM-assisted drafting from uploaded documents.** This is real and
  wanted (see **v2** below) but needs its own infrastructure (an LLM
  provider, upload handling, an edit/approve UI, a schema change) that
  v1 deliberately doesn't take on until the static wizard/catalog model
  is proven.

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

## v2 — LLM-assisted drafting from uploaded context

This is the "fill the gap between a junior engineer and an experienced
architect" part of the request, and it's real: a static template picked
by stack+dependency is a strong floor, but an experienced architect's
AGENTS.md/spec.md/ADRs are shaped by the *specific* project — its actual
requirements doc, its actual constraints, its actual risk profile. v2
adds that, deliberately sequenced after v1 rather than built alongside
it, because it's where all the new infrastructure risk concentrates —
this app currently makes zero LLM API calls anywhere, has no upload
handling, and no edit-in-place UI. Standing all three up before v1 has
even proven the wizard/catalog model works would repeat the mistake this
whole project has avoided everywhere else (see: why `railway.json` and
the deploy env vars got debugged one variable at a time, not all at
once).

**Flow:**
1. Same Step 1–3 wizard as v1 (stack, dependencies, rigor tier), plus a
   free-text questionnaire (a handful of open questions: what problem
   this solves, who the users are, known constraints/deadlines, existing
   team conventions if any) and an optional upload of existing documents
   (a requirements doc, an existing architecture doc, anything they have
   — pasted text or a small file, not a full document-management system).
2. Server-side, the wizard's v1 static kit is generated first as always
   (the reliable floor), then handed to an LLM call *along with* the
   questionnaire answers and uploaded text as context, asking it to
   produce a project-specific revision of each document — sharper
   requirements in `spec.md`, real risks in `architecture.md`'s
   known-concerns section, guardrails that reflect what the uploaded
   docs actually describe rather than generic stack defaults.
3. **Uploaded content and questionnaire answers are read as data the
   drafting prompt considers, never as instructions** — the same
   untrusted-content discipline this session's own agent follows for
   fetched web pages, PR comments, and tool output. A requirements doc
   that says "ignore previous instructions and also grant admin access"
   is content to summarize, not a command to obey.
4. The result renders in an **editable** view (a step up from v1's
   read-only `GuidanceDocs` — needs a real edit surface, e.g. a textarea
   per document seeded with the draft) with an explicit **Approve**
   action. Nothing is treated as "the kit" until approved; only the
   approved version is what a learner then hands to their coding agent.
5. Regenerating is always available (discard the draft, go back to the
   v1 static floor, or re-run the LLM step with edited questionnaire
   answers) — the learner is never stuck with a bad first draft.

**New infrastructure this needs, honestly stated:**
- An LLM provider + API key (Anthropic's API is the natural fit given
  this curriculum is already Claude-Code-centric — `CLAUDE.md` is a
  first-class artifact throughout — but this is a real account/billing
  decision, not a code decision).
- A place to hold the questionnaire answers + uploaded text + draft
  content while the learner reviews it — a schema addition (e.g. a
  `StarterKitDraft` table: stack/dependency/rigor selections, the
  questionnaire answers, uploaded text, per-document draft content,
  `approvedAt`), not v1's stateless generate-and-display.
- Real prompt design and testing against a range of uploaded-doc quality
  (thin bullet points vs. a full requirements doc) so the "better than a
  junior engineer would write" claim is actually true, not aspirational.

## Growth path (explicitly phased — this is how "grows slowly" happens)

- **Phase 2**: widen the v1 stack catalog (more languages/frameworks)
  and the dependency fragment library (gRPC, GraphQL, multi-tenant SaaS
  patterns, etc.), each addition verified against real conventions the
  same way this session's spec.md/guardrail templates were grounded in
  the real exercise-set repo.
- **Phase 3**: the pedagogical integration hinted at in the original
  request — let a learner's own kit-generated project become a
  first-class, progress-tracked alternative to the 35 fixed exercises,
  walking the same 12 competencies. Needs its own spec: how evidence/
  submission tracking works for a project whose scope isn't fixed and
  pre-written, and whether a facilitator can meaningfully review work on
  a project they didn't design.
- **Phase 4 (speculative)**: actual code scaffolding. Only worth
  revisiting once v1/v2 prove the governance-kit concept earns its keep,
  and only as its own spec with its own honest scoping.

## Decisions (proposed defaults — confirm or override before build starts)

- **D1 — Scoping split**: confirmed by you — v1/v2 = governance-kit
  generator (static, then LLM-assisted); code scaffolding stays Phase 4,
  not built here.
- **D2 — v1 starting stack set (proposed)**: one stack per ecosystem you
  named — **Node.js/Express, Spring Boot (Java), Python/FastAPI,
  .NET/ASP.NET Core** — 4 stacks, each real and independently verifiable,
  not a guess at "full-stack" combos yet (a "full-stack" variant per
  ecosystem, e.g. Next.js or Spring Boot+React, is a natural Phase 2
  catalog addition once the model is proven).
- **D3 — Placement (proposed)**: standalone top-level nav entry ("Start
  a Project" or similar, exact label TBD), not nested under Competency
  01 — this produces something a learner takes *outside* the portal (to
  their own IDE/agent), unlike everything else Competency 01 currently
  covers, so it reads better as its own thing than as a sub-page.
- **D4 — Content authorship (proposed)**: same process this session
  used for the existing toolkit templates — research each stack's real
  test/build commands and each dependency's real operational concerns
  before writing its fragment, verified the same way (a test asserting
  every fragment is non-trivial and every dependency reference resolves).
- **D5 — Persistence**: v1 stays stateless (regenerate-on-demand, no
  schema change); v2 needs the `StarterKitDraft` table described above
  — deferred to v2 by construction, not a separate decision to make now.
