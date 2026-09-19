# ADR 0001 — Stack choice: Next.js + Prisma/SQLite

## Status
Accepted

## Context
Single-org internal tool, one facilitator initially, no existing
infrastructure named in the product spec. Needs to be cloneable and
runnable locally with minimal setup (`npm install && npm run dev`), per
the request to build this as an MVP.

## Decision
- **Next.js App Router + TypeScript** for both UI and data mutations
  (server actions), avoiding a separate backend service for v1.
- **Prisma ORM + SQLite** (file-based `dev.db`) instead of Postgres/MySQL —
  zero external infra to stand up the MVP. The schema (`docs/SPEC.md` §6)
  is written to be Postgres-portable: no SQLite-only types, JSON columns
  used only where the spec itself calls for JSON (checklists, bullet
  lists), everything else relational.
- **NextAuth** with the Credentials provider rather than magic-link email
  or SSO, since no identity provider was confirmed (see ADR 0002 Q4).
- **Tailwind CSS** for styling — no design system dependency assumed.

## Consequences
- Moving to a shared/prod deployment later means switching Prisma's
  `datasource` provider and running `prisma migrate` against Postgres —
  no data-model rewrite.
- SQLite is single-writer; fine for one facilitator + a small cohort, not
  a concern this ADR needs to solve for.
