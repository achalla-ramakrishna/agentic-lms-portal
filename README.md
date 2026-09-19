# Agentic LMS Portal

LMS portal for CodeWalnut's Agentic Engineering guidebook: 12
competencies, 35 evidence-graded exercises, learner progress tracking, and
facilitator review.

See [`AGENTS.md`](./AGENTS.md) for house rules and conventions, and
[`docs/SPEC.md`](./docs/SPEC.md) for the full spec and build plan.

## Getting started

```bash
npm install
cp .env.example .env
npm run db:migrate   # creates prisma/dev.db from prisma/schema.prisma
npm run db:seed      # populates it from content/seed.json
npm run dev
```

Open http://localhost:3000, or jump straight to
http://localhost:3000/competencies (auth isn't wired up until chunk 3).

## Regenerating seed content

`content/seed.json` is generated, not hand-written — see
`docs/SPEC.md` §3. To regenerate it against updated sources:

```bash
npm run seed:generate -- \
  --exercise-set   /path/to/agentic-engineering-full-exercises-set \
  --guidebook-html /path/to/folder-of-Competency-XX.html-pages
```

Neither source is vendored into this repo. Then re-run `npm run db:seed`
(idempotent — upserts by number/slug).

## Status

Chunk 2 (content model + real seed data + read-only browsing) — see
`docs/SPEC.md` §7 for the full build plan.
