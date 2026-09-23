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

Open http://localhost:3000 and log in (see demo accounts below) — every
`/competencies/**` page requires a session.

## Demo accounts

Seeded by `npm run db:seed`, dev-only, intentionally fake — never reuse
these values for anything real:

| Role        | Email                    | Password             |
|-------------|--------------------------|-----------------------|
| Learner     | `learner@example.com`     | `learner-demo-pw`     |
| Facilitator | `facilitator@example.com` | `facilitator-demo-pw` |

`prisma/demo-data.ts` also seeds a realistic-named cohort for customer/
conference demos — 5 learners at different progress levels (brand new,
mid-progress with a rework, a pending-review queue, and two advanced/
near-complete) plus a reviewer who has actually decided some of them,
so a roster or dashboard screenshot shows real variety instead of an
empty or flat state. All share one password:

| Role        | Names                                                                                    | Password           |
|-------------|-------------------------------------------------------------------------------------------|---------------------|
| Learner     | `priya.natarajan` · `diego.fernandez` · `liam.carter` · `amara.okafor` · `yuki.tanaka` (`@example.com`) | `Conference2026!`   |
| Facilitator | `jordan.blake@example.com`                                                               | `Conference2026!`   |

`prisma/second-company-demo.ts` seeds a second, distinctly-branded
company (**Acme Robotics**, slug `acme-robotics`, orange accent) —
proof the embed widget and company scoping (`docs/adr/
0004-multi-tenant-companies.md`) work for more than one client, not
just CodeWalnut. Log in at `/login/acme-robotics`:

| Role        | Email                                       | Password          |
|-------------|----------------------------------------------|-------------------|
| Facilitator | `morgan.reyes@acme-robotics.example.com`      | `AcmeDemo2026!`   |
| Learner     | `sam.okoye@acme-robotics.example.com` · `ines.duarte@acme-robotics.example.com` | `AcmeDemo2026!` |

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

## Deploying (Railway)

SQLite is a file on disk (see ADR 0001), so it needs a host with a
persistent volume — Vercel's serverless filesystem won't keep writes
across requests. `railway.json` in this repo already sets the build and
start commands (`prisma migrate deploy` and `db:seed` both run
automatically on every start — `db:seed` is a pure upsert by
competency number / exercise slug / user email, see prisma/seed.ts, so
re-running it never touches or resets learner submissions), so the
manual steps are just the account-level pieces Railway requires
through its own UI:

1. [railway.app](https://railway.app) → sign in with GitHub → **New
   Project → Deploy from GitHub repo** → this repo, `main` branch.
2. Service → Settings → **Volumes** → add one, mount path `/data`.
3. Service → Settings → Networking → **Generate Domain** (confirm the
   target port matches whatever the Deploy Log shows Next.js listening
   on, e.g. `8080` — Railway assigns it via `$PORT`).
4. Service → **Variables**:
   ```
   DATABASE_URL=file:/data/prod.db
   NEXTAUTH_SECRET=<openssl rand -base64 32>
   NEXTAUTH_URL=https://<the domain from step 3>
   ```
5. Save — Railway redeploys automatically. Watch **Deploy Logs** for
   "Ready" with no errors.

The generated domain is the link to share. Demo accounts are the same
ones listed above — fine for an internal walkthrough, not something to
leave linked publicly long-term (no rate limiting or production
hardening yet).

## Status

v1 MVP complete — all 6 build-plan chunks done (toolchain, content model,
auth/roles, learner flow, facilitator flow, polish). See `docs/SPEC.md`
§7 for the full build plan and `docs/adr/` for the decisions behind it.

```bash
npm test  # 19 tests: seed parser, status transitions, roster aggregation
```
