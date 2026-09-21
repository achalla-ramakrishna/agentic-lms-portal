# Feature spec — Learn tab refresh from the real guidebook booklet (rolling out one competency at a time)

Written before implementation, per this repo's convention. Prompted by
the user uploading the real "Agentic Engineering" booklet (v2 PDF,
`codewalnut.com`) and asking the Learn tab to visibly reflect it — the
diagram, the "In Practice" content, and closer visual fidelity —
starting with Competency 01 as a pilot, reviewed and approved, and now
being rolled out to the remaining competencies **one at a time** per the
user's explicit instruction, since each competency's diagram is
structurally bespoke (verified by rendering and reading several
competencies' actual booklet pages before committing to this pacing).

## Competency 02 — Spec Framing

Source: `agentic-engg.-booklet-v2.pdf`, pages 6–7. Same treatment as
Competency 01: `tagline`, the full 3-paragraph `shiftMarkdown`, 7
`inPracticeBullets` (3 with `**bold**` terms), and a bespoke diagram
(`SpecFramingDiagram.tsx`) — a two-column Vague Request (danger-tinted)
vs. A Contract It Can Test (success-tinted) comparison, plus a bottom "A
Spec Spells Out" pill list, reusing the existing
`border-danger-fg/50 bg-danger-fg/10` / `border-success-fg/50
bg-success-fg/10` card tokens rather than custom SVG line art (same
approach as `AgentCoreDiagram`'s `Connector`).

Unlike Competency 01, `toolkitTags` **was** updated here: the booklet
lists 7 tags (`/plan`, `spec.md`, `acceptance criteria`, `superpowers
skill`, `spec-kit skill`, `Given/When/Then`, `EARS`) against the seed's
previous 5 (missing the two skill tags) — reconciled to match the
booklet, since by this competency the discrepancy pattern was already
flagged once for competency 1 and the user's continued "follow the
booklet" instruction covers it.

A new `CompetencyDiagram.tsx` dispatcher (`competencyNumber` →
`AgentCoreDiagram` for 1, `SpecFramingDiagram` for 2, `null` for the
rest) replaces `CompetencyTabs.tsx`'s previous hardcoded
`AgentCoreDiagram` import, since the diagram is no longer
competency-1-only.

## Competency 03 — Context Engineering

Source: `agentic-engg.-booklet-v2.pdf`, pages 9–10. Same treatment
again: `tagline`, full 3-paragraph `shiftMarkdown`, 7
`inPracticeBullets` (3 bold), and a bespoke diagram
(`ContextLayerDiagram.tsx`) — a 7-card grid (Repo overview,
Architecture, Conventions, Module map, Data flows · APIs, ADRs,
Commands) using this app's named color tokens (`success`, `accent`,
`attention`, `done`) to match the booklet's own color grouping, no new
colors invented. `CompetencyDiagram.tsx` gained a `case 3`.

This page also has a real pull-quote (Ben SE, CTO, CodeWalnut) — the
first competency with one. Rather than hardcode it into the diagram
component, added two new generic `Competency` fields,
`quoteMarkdown`/`quoteAttribution` (both `@default("")`, migration
`20260921112958_add_quote_fields`), and a conditional blockquote block
in `CompetencyTabs.tsx` between "In Practice" and the mastery/mistake
grid — reusable by any future competency that has a quote, empty
everywhere else.

`toolkitTags` reconciled again (booklet's 8 vs. the seed's previous 5:
added `CLAUDE.md`, `Skills`, `Flow Diagrams`). `Skills` already
classifies correctly under `lib/artifact-icons.ts`'s existing
keyword-based `skill` category; `Flow Diagrams` needed a new
`EXACT_OVERRIDES` entry (same pattern as `c4`/`ears`) since it has no
generic keyword match. Both tags, plus `superpowers skill`/`spec-kit
skill` from competency 2, needed new `lib/artifact-glossary.ts`
entries so the existing full-coverage test keeps passing.

## Competency 04 — Test Automation

Source: `agentic-engg.-booklet-v2.pdf`, pages 11–12. Same treatment:
`tagline`, full 3-paragraph `shiftMarkdown`, 6 `inPracticeBullets` (3
bold), a real pull-quote (reusing the `quoteMarkdown`/
`quoteAttribution` fields added for competency 3), and a bespoke
diagram (`TestPyramidDiagram.tsx`) — a numbered vertical timeline
(End-to-End/3 → Integration/2 → Unit Tests/1) plus a "Pro Tip" callout
about mutation testing, again using this app's existing color tokens
(accent, done, success, attention) to match the booklet's grouping.
`CompetencyDiagram.tsx` gained a `case 4`.

`toolkitTags` reconciled once more (booklet's 6 vs. the seed's
previous 5: added `Fixtures`). `Fixtures` needed both a new
`EXACT_OVERRIDES` entry in `lib/artifact-icons.ts` (no generic keyword
match, classifies as `test`) and a new `lib/artifact-glossary.ts`
entry.

## Source

`agentic-engg.-booklet-v2.pdf`, pages 4–5 (Competency 01, "01 / 12").
Text extracted via `pdftotext -layout` and cross-checked against
rendered page images (`pdftoppm`) — both the "THE SHIFT" page (with a
concept diagram) and the "In Practice" page (bullets, mastery/mistake
boxes, Toolkit) were read directly, not summarized from memory.

## What's actually new vs. what already matches

Checked the booklet against `content/seed.json`'s existing competency 1
entry before changing anything:

- `masteryBullets`, `commonMistakeMarkdown` — already match the
  booklet's own wording verbatim.
- `shiftMarkdown` — the seed initially had a condensed version of the
  booklet's fuller 3-paragraph text; not wrong, just shorter. Left
  as-is in the first pass, then the user explicitly asked for the full
  text verbatim too — updated to the exact 3-paragraph booklet text,
  same extraction verified earlier (`pdftotext -layout` cross-checked
  against the rendered page). Required one rendering fix alongside it:
  the Shift `<p>` had no `whitespace-pre-line`, so the `\n\n` paragraph
  breaks in the fuller text would have collapsed into one run-on block
  — added that class (safe for every other competency too, a no-op
  where there's no newline in the string).
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
- Changing `toolkitTags` — flagged above, not acted on without a
  separate decision (`shiftMarkdown` *was* changed — see above).
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
