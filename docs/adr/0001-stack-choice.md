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

## Known accepted risk: pinned at Prisma 6, not 7

`npm audit` flags a high-severity stack-exhaustion advisory
(GHSA-ggr8-5vv4-36mx, `deepmerge-ts` < 8.0.0) reachable only through the
`prisma` CLI's `@prisma/config` dependency. Verified via `npm ls
deepmerge-ts` / `npm ls @prisma/client`: `@prisma/client` — the package
actually imported by app code and bundled into the deployed app — has no
dependency on it at all. The chain exists solely in `prisma`, a
devDependency invoked at `generate`/`migrate`/`db seed` time, never at
request time. Accepted as-is rather than forcing a Prisma 7 upgrade, which
is a breaking architecture change (drops schema-file `datasource.url` in
favor of `prisma.config.ts` + an explicit driver adapter per database) that
deserves its own ADR and migration pass, not a reflexive `audit fix
--force` mid-chunk. Revisit when Prisma 6 stops receiving fixes.
