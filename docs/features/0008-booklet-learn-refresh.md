# Feature spec — Learn tab refresh from the real guidebook booklet (pilot: Competency 01)

Written before implementation, per this repo's convention. Prompted by
the user uploading the real "Agentic Engineering" booklet (v2 PDF,
`codewalnut.com`) and asking the Learn tab to visibly reflect it — the
diagram, the "In Practice" content, and closer visual fidelity —
starting with one competency as a pilot before deciding whether to roll
out to all 12.

## Source

`agentic-engg.-booklet-v2.pdf`, pages 4–5 (Competency 01, "01 / 12").
Text extracted via `pdftotext -layout` and cross-checked against
rendered page images (`pdftoppm`) — both the "THE SHIFT" page (with a
concept diagram) and the "In Practice" page (bullets, mastery/mistake
boxes, Toolkit) were read directly, not summarized from memory.

## What's actually new vs. what already matches

Checked the booklet against `content/seed.json`'s existing competency 1
entry before changing anything:

- `shiftMarkdown`, `masteryBullets`, `commonMistakeMarkdown` — already
  match the booklet's own wording (the seed's Shift text is a condensed
  version of the booklet's fuller 3-paragraph text; not changed here,
  since the user didn't ask for that and it isn't wrong, just shorter).
- `toolkitTags` — the booklet lists 12 tags for competency 1; the seed
  currently has 6 (missing `.guidelines/`, `/permissions`, `gh`,
  `vercel`, `gcp`, `playwright-cli`). **Not changed here** — the user
  explicitly said to retain the Toolkit section as-is. Flagged as a
  real discrepancy worth a separate decision, not silently fixed.
- **"In Practice"** (10 bullets) — genuinely absent from the content
  model entirely. This is the real gap.
- **The concept diagram** (Agent core / Rules / Guardrails / Least
  Privilege / Secrets-deny) — a different diagram from the existing
  `ActivityFlow` (input→activity→output artifacts), which the user
  explicitly asked to retain, not replace. This is additive.

## Goal

Competency 01's Learn tab gains two things the booklet has and the app
didn't: an "In Practice" bullet list, and a concept diagram next to The
Shift. "What mastery looks like" / "Common mistake to avoid" get a
visual upgrade (tinted card backgrounds, matching the booklet's card
treatment) using this app's own already-defined design tokens
(`success-subtle`, `attention-subtle`) — applied to all competencies
since it's a pure style change, not content-dependent. `ActivityFlow`
and `ToolkitHub` are untouched.

## Non-goals (this pilot)

- Rolling out to the other 11 competencies — explicitly staged as a
  pilot; the user reviews competency 1 first.
- Changing `shiftMarkdown` or `toolkitTags` — flagged above, not acted
  on without a separate decision.
- Automating extraction from the booklet PDF via
  `scripts/generate-seed.mjs`. That script's real job is parsing the
  guidebook's actual HTML source pages, which aren't available in this
  session — only the PDF is. `content/seed.json`'s new
  `inPracticeBullets` for competency 1 is hand-transcribed and verified
  against the real PDF text extraction above (not fabricated), but it's
  a manual addition, not a generator change. `generate-seed.mjs`'s
  existing merge-mode behavior (carries over existing competencies
  unchanged when `--guidebook-html` is omitted) already protects this
  from being silently wiped by a future regeneration — verified by
  reading that function before relying on it, not assumed.
- The diagram's exact colors don't copy the booklet's blue literally —
  it uses this app's own per-competency palette (`competencyStyle`,
  already green for competency 1) for the center card, consistent with
  every other diagram in this app, rather than fighting the existing
  design system for a closer color match to one static PDF.

## Data model

`Competency.inPracticeBullets: String` (JSON-encoded `string[]`,
`@default("[]")`) — same pattern as `masteryBullets`/`toolkitTags`.
Empty for every competency except 01 until a future pilot-rollout
decision.

## Implementation

- `prisma/schema.prisma` + migration.
- `content/seed.json` — competency 1 gets the real 10 bullets; all
  others get `[]`.
- `prisma/seed.ts` — upsert reads/writes the new field (idempotent, same
  as every other field).
- `app/(app)/competencies/[number]/AgentCoreDiagram.tsx` (new) — the
  concept diagram, hardcoded to competency 1's real content for this
  pilot (not yet data-driven — see Non-goals), styled with this app's
  existing card/token system, no new colors invented.
- `CompetencyTabs.tsx` — Learn tab: Shift + diagram side-by-side when
  `inPracticeBullets.length > 0` (i.e. only competency 1 renders the
  diagram), a new "In Practice" section, tinted-card mastery/mistake
  boxes for every competency, `ActivityFlow`/`ToolkitHub` unchanged.
- `page.tsx` — thread `inPracticeBullets` through as a new prop.

## Acceptance criteria

- [ ] Competency 01's Learn tab shows "In Practice" with all 10 real
  bullets, verbatim from the booklet.
- [ ] The diagram renders only for competency 01; every other
  competency's Learn tab is visually unchanged except for the
  mastery/mistake card-background polish.
- [ ] Mastery/mistake tinted cards render correctly for all 12
  competencies (a style change, so it must not depend on
  `inPracticeBullets` being populated).
- [ ] `ActivityFlow` and `ToolkitHub` sections are byte-identical in
  behavior to before this change.
- [ ] `npm run build` clean, `npm test` passing, a fresh reseed
  succeeds, and a live Playwright screenshot of competency 1's Learn
  tab is reviewed before shipping.
