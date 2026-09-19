# ADR 0003 — Dark theme, GitHub-inspired

## Status
Accepted

## Context
User feedback mid-chunk-6: preference for a dark theme, with GitHub's
content formatting named specifically as a reference point worth
following.

## Decision
Adopted a dark palette approximating GitHub's Primer dark theme —
`#0d1117` canvas, `#161b22` card surfaces, `#30363d` borders, `#e6edf3`/
`#8b949e` text, `#58a6ff` accent (links), `#238636` primary-action green,
and status colors (green/yellow/red/purple) matching GitHub's
success/attention/danger/done semantics for label-style pills. Tokens
live in `tailwind.config.ts` (`canvas`, `line`, `fg`, `accent`, `success`,
`attention`, `danger`, `done`) rather than being hand-picked per
component, so the palette has one source of truth.

Also dropped the serif "Fraunces" wordmark styling in favor of a plain
system sans-serif stack — GitHub's own UI doesn't use a display serif
anywhere, and keeping one would have fought the rest of the borrowed
visual language rather than fit it.

No light-mode toggle for v1 — a single dark theme, not a
`prefers-color-scheme` switch, since nothing in the product spec asked
for user-selectable themes and it isn't worth the added state for an
internal tool with one committed direction.

## Consequences
- Status badges (not started / in progress / submitted / needs rework /
  passed) map onto GitHub's label-pill visual language: muted gray,
  accent blue, done purple, attention yellow, success green respectively
  — recognizable to anyone who reads GitHub PR/issue labels daily, which
  is the intended audience.
- Every page under `app/` was touched for this (light-theme utility
  classes swapped for the new tokens) — a single visual pass, not a
  themeable abstraction layer, since there's only one theme.
