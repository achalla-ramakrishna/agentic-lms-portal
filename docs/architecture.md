# Architecture

## Stack

- **Next.js (App Router, TypeScript)** — single deployable, server
  components for data-heavy pages (roster, competency/exercise detail),
  server actions for mutations (start/submit exercise, facilitator
  decision). No separate API layer for v1.
- **Prisma + SQLite** — zero external infra for a single-org MVP; the
  schema is written so swapping the datasource to Postgres later is a
  provider-line change, not a model rewrite (see ADR 0001).
- **NextAuth (Credentials provider)** — no SSO available yet (ADR 0002 Q4);
  seeded demo users for learner/facilitator roles.
- **Tailwind CSS** — utility styling, no design system dependency for v1.

## Data flow

```
content/seed.json  --(prisma/seed.ts, idempotent upsert by slug)-->  SQLite
                                                                        |
Learner/Facilitator  <--(server components, Prisma queries)-----------+
       |
       +--(server actions: start, submit, decide)--> SQLite (submission,
                                                        evidence_artifact)
```

- `content/seed.json` is generated once (chunk 2) from the
  `agentic-engineering-full-exercises-set` repo's root `README.md` index
  table and each exercise's `README.md`. The portal repo does not vendor
  the exercise-set repo's source code — only the structured
  content extracted from its READMEs.
- Evidence is link-only for v1 (ADR 0002 Q3): the portal stores a URL and
  an optional note per checklist item, never a file blob.
- Ordering is enforced at the query layer (`ORDER BY number ASC`), not left
  to client-side sort — see `docs/SPEC.md` §4.

## Seam for Stage 2 (out of scope here, documented for the next builder)

The original product spec (`docs/SPEC.md` §8) reserves a `verify_run`
table keyed on `submission_id` for real CI-driven verification later. The
current schema doesn't include it — adding it is additive (a new table +
FK), not a migration of `submission` or `evidence_artifact`.
