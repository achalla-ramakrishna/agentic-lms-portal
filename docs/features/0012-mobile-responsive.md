# Feature spec — Mobile responsive pass

Written before implementation, per this repo's convention. Prompted by
the user: "can you make all the pages mobile responsive."

## Approach

Surveyed the whole app at 375px width (iPhone SE-class, the narrowest
common target) via live Playwright screenshots before writing any
code — most pages already degraded reasonably well because earlier
work in this session (the dashboard rebuild, the 12 diagram
components) already used responsive Tailwind classes
(`grid-cols-1 sm:grid-cols-2`, etc.). Fixed only what actually broke,
rather than rewriting pages that were already fine.

## What was actually broken

1. **The shared shell** (every authenticated page): `AppSidebar` was a
   fixed `w-64` always-visible column and `AppHeader` had ~6 nav items
   inline with no wrap — on a 375px screen the sidebar alone ate most
   of the width, and the header would have overflowed badly (caught
   this by inspection before it ever got a screenshot, since it was
   the obvious highest-leverage issue).
2. **Landing page snake numbering**: `CompetencyShowcase`'s hardcoded
   `SNAKE_ORDER` array reordered the DOM to draw a clean S-shaped
   connector line, tuned for the 4-column desktop grid. At 2 columns
   (mobile) the same reorder made competencies read 1,2,3,4,8,7,6,5...
   top to bottom — confusing, looked broken.
3. **Competencies list**: title + "N exercises" count had no gap, so
   a long title ("Context Engineering") ran directly into the count
   with zero space between them.
4. **Exercises tab** (inside `CompetencyTabs.tsx`): exercise titles
   were forced onto the same row as the duration label + status badge
   + info button, truncating titles to 1-2 characters ("T..") on
   narrow screens.
5. **Exercise detail page & Submission page headers**: title next to
   a duration badge / status badge with no wrap — title text wrapping
   to 2 lines crowded straight into the badge.
6. **Guidance-doc markdown tables**: no defensive `overflow-x`, so a
   wider table (more columns than the one spot-checked) could have
   blown out the page width on a future guidance doc.

## Non-goals

- Rewriting admin tables (roster's 15-column grid, users list) into
  mobile card layouts — both already have `overflow-x-auto` wrappers,
  so they scroll within their own container rather than breaking the
  page. Acceptable for a facilitator-facing data table (same pattern
  GitHub/Stripe use), and a full card-based redesign is a much bigger
  change than "responsive" strictly requires.
- A hamburger menu animation library — plain CSS `transform`/
  `transition`, no new dependency.
- Changing anything about desktop layout — verified via 1440px
  screenshots after every fix that nothing regressed there.

## Implementation

- `app/mobile-nav.tsx` (new) — `MobileNavProvider` (React Context
  holding one `open` boolean), `MenuToggleButton` (hamburger, rendered
  inside `AppHeader`/admin's header), `MobileSidebarFrame` (wraps
  `AppSidebar`, off-canvas drawer below `md:`, normal static column at
  `md:` and up). Context, not prop-drilling or duplicate rendering,
  because the button and the drawer are siblings in the tree (each
  under a different server component — `AppHeader` and `AppSidebar`)
  that need to share one boolean; `AppSidebar` still renders exactly
  once either way, so no duplicate DB query.
- `app/(app)/layout.tsx`, `app/admin/layout.tsx` — wrapped in
  `MobileNavProvider` + `MobileSidebarFrame`; `AppHeader`/admin's
  header hide their nav links below `md:` (the drawer already has
  every one of them) and gained the toggle button.
- `app/app-sidebar.tsx` — `w-64` → `w-full h-full` so it fills
  whichever wrapper (`w-72` drawer or `md:w-64` static column) is
  actually giving it its width, instead of double-declaring one.
- `app/competency-showcase.tsx` — cards render in plain 1→12 order;
  the old `SNAKE_ORDER` array is now applied purely as CSS `order`
  values at `md:` (it's a self-inverse row-reversal permutation, so
  the same array works for both "visual position → card" and "card →
  order value"). The connector-line hook needed no changes — it
  already draws between wherever competency N and N+1 land, regardless
  of visual order.
- `app/(app)/competencies/page.tsx`, `CompetencyTabs.tsx`'s Exercises
  tab, the exercise detail page, and the submission page — the same
  fix pattern throughout: `flex-wrap` + `gap-x-3 gap-y-1` on the row,
  `min-w-0` on the growing title, `shrink-0` on the badge/count that
  shouldn't be squeezed. Exercises tab also hides the duration label
  below `sm:` (least essential info, freed the row).
- `app/globals.css` — `.markdown-body table` gets
  `display: block; overflow-x: auto;`, a standard no-JS responsive-
  table pattern, defensive for any guidance doc wider than the one
  actually checked.

## Acceptance criteria

- [x] Every authenticated page has a working hamburger-triggered
  drawer nav below `md:`, with the desktop sidebar/header completely
  unaffected at `md:` and up (verified via 1440px screenshots).
- [x] Landing page competency numbers read 1→12 top-to-bottom on
  mobile; the 4-column snake shape still renders correctly on desktop.
- [x] No title/badge text collisions on any page checked (dashboard,
  landing, login, competencies list, competency detail — all 3 tabs
  on 3 different competencies including the circular diagram, exercise
  detail, submission page, submission-review, account, my progress,
  admin roster, admin users) — verified via live Playwright screenshots
  at 375px, each bug found was re-screenshotted after the fix.
- [x] No horizontal page overflow on any checked page (`scrollWidth >
  clientWidth` checked programmatically, not just eyeballed).
- [x] `npm run build` clean, `npm test` 77/77, a fresh reseed
  succeeds, and desktop screenshots after every mobile fix confirm no
  regression there.
